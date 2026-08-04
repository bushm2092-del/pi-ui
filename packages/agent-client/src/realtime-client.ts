import {
  GATEWAY_PROTOCOL_VERSION,
  parseGatewayServerMessage,
  type GatewayClientMessage,
  type GatewayServerMessage,
  type RuntimeSnapshotDto
} from "@pi/protocol";

export type RealtimeConnectionState = "idle" | "connecting" | "connected" | "reconnecting" | "closed";

export interface RuntimeEvent {
  streamId: string;
  cursor: number;
  runtimeSlotId: string;
  event: string;
  payload: Extract<GatewayServerMessage, { kind: "runtime.event" }>["payload"];
}

export interface RuntimeSubscriptionListener {
  onSnapshot?(snapshot: RuntimeSnapshotDto, reason: "synchronized" | "reset"): void;
  onEvent?(event: RuntimeEvent): void;
  onError?(error: RealtimeClientError): void;
}

export interface WebSocketLike {
  readonly readyState: number;
  onopen: ((event: unknown) => void) | null;
  onmessage: ((event: { data: unknown }) => void) | null;
  onclose: ((event: unknown) => void) | null;
  onerror: ((event: unknown) => void) | null;
  send(data: string): void;
  close(code?: number, reason?: string): void;
}

export interface RuntimeRealtimeClientOptions {
  webSocketUrl: string;
  token: string;
  webSocketFactory?: (url: string, protocols: string[]) => WebSocketLike;
  reconnectBaseDelayMs?: number;
  reconnectMaxDelayMs?: number;
  connectionTimeoutMs?: number;
  random?: () => number;
}

interface RuntimeSubscription {
  id: string;
  runtimeSlotId: string;
  listener: RuntimeSubscriptionListener;
  resume?: { streamId: string; afterCursor: number };
}

interface ConnectWaiter {
  resolve(): void;
  reject(error: Error): void;
  timer: ReturnType<typeof setTimeout>;
}

export class RealtimeClientError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly retryable: boolean
  ) {
    super(message);
    this.name = "RealtimeClientError";
  }
}

export class RuntimeRealtimeClient {
  #state: RealtimeConnectionState = "idle";
  #socket?: WebSocketLike;
  #subscriptions = new Map<string, RuntimeSubscription>();
  #stateListeners = new Set<(state: RealtimeConnectionState) => void>();
  #connectWaiters = new Set<ConnectWaiter>();
  #reconnectTimer?: ReturnType<typeof setTimeout>;
  #reconnectAttempt = 0;
  #closedByClient = false;

  constructor(private readonly options: RuntimeRealtimeClientOptions) {
    if (!options.token) throw new Error("Realtime token must not be empty");
  }

  get state(): RealtimeConnectionState {
    return this.#state;
  }

  connect(): Promise<void> {
    if (this.#state === "connected") return Promise.resolve();
    this.#closedByClient = false;
    if (!this.#socket && !this.#reconnectTimer) this.#open();
    return new Promise<void>((resolve, reject) => {
      const waiter: ConnectWaiter = {
        resolve,
        reject,
        timer: setTimeout(() => {
          this.#connectWaiters.delete(waiter);
          reject(new RealtimeClientError("connection_timeout", "Timed out connecting to Pi backend", true));
        }, this.options.connectionTimeoutMs ?? 10_000)
      };
      this.#connectWaiters.add(waiter);
    });
  }

  close(): void {
    this.#closedByClient = true;
    if (this.#reconnectTimer) clearTimeout(this.#reconnectTimer);
    this.#reconnectTimer = undefined;
    const socket = this.#socket;
    this.#socket = undefined;
    socket?.close(1000, "client_shutdown");
    this.#setState("closed");
    this.#rejectConnectWaiters(new RealtimeClientError("client_closed", "Realtime client was closed", false));
  }

  onStateChange(listener: (state: RealtimeConnectionState) => void): () => void {
    this.#stateListeners.add(listener);
    return () => this.#stateListeners.delete(listener);
  }

  subscribe(runtimeSlotId: string, listener: RuntimeSubscriptionListener): { subscriptionId: string; unsubscribe(): void } {
    const id = globalThis.crypto.randomUUID();
    this.#subscriptions.set(id, { id, runtimeSlotId, listener });
    if (this.#state === "connected") this.#sendSubscription(this.#subscriptions.get(id)!);
    return {
      subscriptionId: id,
      unsubscribe: () => {
        if (!this.#subscriptions.delete(id)) return;
        this.#send({ v: GATEWAY_PROTOCOL_VERSION, kind: "unsubscribe", subscriptionId: id });
      }
    };
  }

  #open(): void {
    if (this.#closedByClient || this.#socket) return;
    this.#setState(this.#reconnectAttempt === 0 ? "connecting" : "reconnecting");
    const factory = this.options.webSocketFactory ?? defaultWebSocketFactory;
    let socket: WebSocketLike;
    try {
      socket = factory(this.options.webSocketUrl, ["pi-ui.v1", `pi-ui-token.${this.options.token}`]);
    } catch {
      this.#scheduleReconnect();
      return;
    }
    this.#socket = socket;
    socket.onopen = () => undefined;
    socket.onmessage = (event) => this.#receive(event.data);
    socket.onerror = () => undefined;
    socket.onclose = () => {
      if (this.#socket !== socket) return;
      this.#socket = undefined;
      if (!this.#closedByClient) this.#scheduleReconnect();
    };
  }

  #receive(data: unknown): void {
    let message: GatewayServerMessage;
    try {
      const text = typeof data === "string" ? data : data instanceof ArrayBuffer
        ? new TextDecoder().decode(data)
        : String(data);
      message = parseGatewayServerMessage(JSON.parse(text));
    } catch (error) {
      this.#notifyAll(new RealtimeClientError(
        "invalid_server_message",
        error instanceof Error ? error.message : String(error),
        false
      ));
      return;
    }
    if (message.kind === "connection.ready") {
      this.#reconnectAttempt = 0;
      this.#setState("connected");
      this.#resolveConnectWaiters();
      for (const subscription of this.#subscriptions.values()) this.#sendSubscription(subscription);
      return;
    }
    if (message.kind === "pong") return;
    if (message.kind === "error") {
      const error = new RealtimeClientError(message.code, message.message, message.retryable);
      const subscription = message.subscriptionId ? this.#subscriptions.get(message.subscriptionId) : undefined;
      if (subscription) subscription.listener.onError?.(error);
      else this.#notifyAll(error);
      return;
    }
    const subscription = this.#subscriptions.get(message.subscriptionId);
    if (!subscription) return;
    if (message.kind === "subscription.ready") {
      const wasResuming = Boolean(subscription.resume);
      subscription.listener.onSnapshot?.(message.snapshot, "synchronized");
      if (!wasResuming && message.streamId && message.latestCursor !== undefined) {
        subscription.resume = { streamId: message.streamId, afterCursor: message.latestCursor };
      }
      return;
    }
    if (message.kind === "subscription.reset_required") {
      subscription.resume = undefined;
      subscription.listener.onSnapshot?.(message.snapshot, "reset");
      return;
    }
    if (
      subscription.resume?.streamId === message.streamId &&
      message.cursor <= subscription.resume.afterCursor
    ) return;
    subscription.resume = { streamId: message.streamId, afterCursor: message.cursor };
    subscription.listener.onEvent?.({
      streamId: message.streamId,
      cursor: message.cursor,
      runtimeSlotId: message.runtimeSlotId,
      event: message.event,
      payload: message.payload
    });
  }

  #sendSubscription(subscription: RuntimeSubscription): void {
    this.#send({
      v: GATEWAY_PROTOCOL_VERSION,
      kind: "subscribe",
      subscriptionId: subscription.id,
      runtimeSlotId: subscription.runtimeSlotId,
      resume: subscription.resume
    });
  }

  #send(message: GatewayClientMessage): void {
    const socket = this.#socket;
    if (this.#state === "connected" && socket?.readyState === 1) socket.send(JSON.stringify(message));
  }

  #scheduleReconnect(): void {
    if (this.#closedByClient || this.#reconnectTimer) return;
    this.#setState("reconnecting");
    const base = this.options.reconnectBaseDelayMs ?? 500;
    const maximum = this.options.reconnectMaxDelayMs ?? 15_000;
    const exponential = Math.min(maximum, base * 2 ** this.#reconnectAttempt++);
    const jitter = exponential * 0.2 * (this.options.random ?? Math.random)();
    this.#reconnectTimer = setTimeout(() => {
      this.#reconnectTimer = undefined;
      this.#open();
    }, exponential + jitter);
  }

  #setState(state: RealtimeConnectionState): void {
    if (this.#state === state) return;
    this.#state = state;
    for (const listener of this.#stateListeners) listener(state);
  }

  #resolveConnectWaiters(): void {
    for (const waiter of this.#connectWaiters) {
      clearTimeout(waiter.timer);
      waiter.resolve();
    }
    this.#connectWaiters.clear();
  }

  #rejectConnectWaiters(error: Error): void {
    for (const waiter of this.#connectWaiters) {
      clearTimeout(waiter.timer);
      waiter.reject(error);
    }
    this.#connectWaiters.clear();
  }

  #notifyAll(error: RealtimeClientError): void {
    for (const subscription of this.#subscriptions.values()) subscription.listener.onError?.(error);
  }
}

function defaultWebSocketFactory(url: string, protocols: string[]): WebSocketLike {
  return new WebSocket(url, protocols) as unknown as WebSocketLike;
}
