import { randomUUID } from "node:crypto";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import {
  GATEWAY_PROTOCOL_VERSION,
  GatewayProtocolValidationError,
  type GatewayServerMessage,
  type WorkerEventMessage,
  parseGatewayClientMessage
} from "@pi/protocol";
import { WebSocket, WebSocketServer } from "ws";
import { EventStreamRegistry } from "../core/event-stream-registry.js";
import { RuntimeService } from "../modules/runtimes/runtime-service.js";
import { isGatewayAuthorized, isOriginAllowed } from "./gateway-security.js";
import { createPiHttpApp } from "./http-app.js";

const HEARTBEAT_INTERVAL_MS = 15_000;

export interface PiGatewayOptions {
  runtimeService: RuntimeService;
  eventStreams: EventStreamRegistry;
  token: string;
  host?: string;
  port?: number;
  allowedOrigins?: string[];
}

export interface PiGatewayAddress {
  host: string;
  port: number;
  httpUrl: string;
  webSocketUrl: string;
}

interface LiveSocket extends WebSocket {
  isAlive?: boolean;
}

export class PiGateway {
  #server?: Server;
  #webSockets?: WebSocketServer;
  #heartbeat?: NodeJS.Timeout;
  #sockets = new Set<LiveSocket>();

  constructor(private readonly options: PiGatewayOptions) {
    if (!options.token) throw new Error("Gateway token must not be empty");
  }

  async start(): Promise<PiGatewayAddress> {
    if (this.#server) throw new Error("Gateway is already started");
    const app = createPiHttpApp({
      runtimeService: this.options.runtimeService,
      token: this.options.token,
      allowedOrigins: this.options.allowedOrigins
    });
    const server = createServer(app);
    const webSockets = new WebSocketServer({
      noServer: true,
      handleProtocols(protocols) {
        return protocols.has("pi-ui.v1") ? "pi-ui.v1" : false;
      }
    });
    server.on("upgrade", (request, socket, head) => {
      const path = safeUrl(request.url).pathname;
      if (
        path !== "/v1/events" ||
        !isOriginAllowed(request, this.options.allowedOrigins) ||
        !isGatewayAuthorized(request, this.options.token)
      ) {
        socket.write("HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n");
        socket.destroy();
        return;
      }
      webSockets.handleUpgrade(request, socket, head, (webSocket) => {
        webSockets.emit("connection", webSocket, request);
      });
    });
    webSockets.on("connection", (socket) => this.#handleWebSocket(socket as LiveSocket));
    this.#server = server;
    this.#webSockets = webSockets;
    await new Promise<void>((resolve, reject) => {
      server.once("error", reject);
      server.listen(this.options.port ?? 0, this.options.host ?? "127.0.0.1", () => {
        server.off("error", reject);
        resolve();
      });
    });
    this.#startHeartbeat();
    const address = server.address() as AddressInfo;
    const displayHost = address.family === "IPv6" ? `[${address.address}]` : address.address;
    return {
      host: address.address,
      port: address.port,
      httpUrl: `http://${displayHost}:${address.port}`,
      webSocketUrl: `ws://${displayHost}:${address.port}/v1/events`
    };
  }

  async stop(): Promise<void> {
    if (this.#heartbeat) clearInterval(this.#heartbeat);
    this.#heartbeat = undefined;
    for (const socket of this.#sockets) socket.close(1001, "server_shutdown");
    this.#sockets.clear();
    const webSockets = this.#webSockets;
    this.#webSockets = undefined;
    if (webSockets) await new Promise<void>((resolve) => webSockets.close(() => resolve()));
    const server = this.#server;
    this.#server = undefined;
    if (server) await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }

  #handleWebSocket(socket: LiveSocket): void {
    const connectionId = randomUUID();
    const subscriptions = new Map<string, () => void>();
    socket.isAlive = true;
    this.#sockets.add(socket);
    socket.on("pong", () => { socket.isAlive = true; });
    socket.on("close", () => {
      this.#sockets.delete(socket);
      for (const unsubscribe of subscriptions.values()) unsubscribe();
      subscriptions.clear();
    });
    this.#send(socket, {
      v: GATEWAY_PROTOCOL_VERSION,
      kind: "connection.ready",
      connectionId,
      heartbeatIntervalMs: HEARTBEAT_INTERVAL_MS
    });
    socket.on("message", (data, isBinary) => {
      void (async () => {
        try {
          if (isBinary) throw new GatewayProtocolValidationError("Binary messages are not supported");
          const message = parseGatewayClientMessage(JSON.parse(data.toString("utf8")));
          if (message.kind === "ping") {
            this.#send(socket, { v: GATEWAY_PROTOCOL_VERSION, kind: "pong", requestId: message.requestId });
            return;
          }
          if (message.kind === "unsubscribe") {
            subscriptions.get(message.subscriptionId)?.();
            subscriptions.delete(message.subscriptionId);
            return;
          }
          subscriptions.get(message.subscriptionId)?.();
          const snapshot = await this.options.runtimeService.get(message.runtimeSlotId);
          const attachment = this.options.eventStreams.attach(
            message.runtimeSlotId,
            message.resume,
            (event) => this.#sendRuntimeEvent(socket, message.subscriptionId, event)
          );
          subscriptions.set(message.subscriptionId, attachment.unsubscribe);
          if (attachment.resetReason) {
            this.#send(socket, {
              v: GATEWAY_PROTOCOL_VERSION,
              kind: "subscription.reset_required",
              subscriptionId: message.subscriptionId,
              runtimeSlotId: message.runtimeSlotId,
              snapshot,
              reason: attachment.resetReason
            });
          } else {
            this.#send(socket, {
              v: GATEWAY_PROTOCOL_VERSION,
              kind: "subscription.ready",
              subscriptionId: message.subscriptionId,
              runtimeSlotId: message.runtimeSlotId,
              snapshot,
              streamId: attachment.streamId,
              latestCursor: attachment.latestCursor
            });
            for (const event of attachment.replay) this.#sendRuntimeEvent(socket, message.subscriptionId, event);
          }
        } catch (error) {
          const subscriptionId = readSubscriptionId(data.toString("utf8"));
          this.#send(socket, {
            v: GATEWAY_PROTOCOL_VERSION,
            kind: "error",
            code: error instanceof GatewayProtocolValidationError ? "invalid_message" : "subscription_failed",
            message: error instanceof Error ? error.message : String(error),
            retryable: false,
            subscriptionId
          });
        }
      })();
    });
  }

  #sendRuntimeEvent(socket: WebSocket, subscriptionId: string, event: WorkerEventMessage): void {
    if (!event.runtimeSlotId) return;
    this.#send(socket, {
      v: GATEWAY_PROTOCOL_VERSION,
      kind: "runtime.event",
      subscriptionId,
      streamId: event.streamId,
      cursor: event.cursor,
      runtimeSlotId: event.runtimeSlotId,
      event: event.event,
      payload: event.payload
    });
  }

  #send(socket: WebSocket, message: GatewayServerMessage): void {
    if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
  }

  #startHeartbeat(): void {
    this.#heartbeat = setInterval(() => {
      for (const socket of this.#sockets) {
        if (socket.isAlive === false) {
          socket.terminate();
          continue;
        }
        socket.isAlive = false;
        socket.ping();
      }
    }, HEARTBEAT_INTERVAL_MS);
    this.#heartbeat.unref();
  }
}

function safeUrl(value: string | undefined): URL {
  return new URL(value ?? "/", "http://localhost");
}

function readSubscriptionId(raw: string): string | undefined {
  try {
    const value = JSON.parse(raw) as Record<string, unknown>;
    return typeof value.subscriptionId === "string" ? value.subscriptionId : undefined;
  } catch {
    return undefined;
  }
}
