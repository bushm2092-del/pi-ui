import { createRequire } from "node:module";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { GatewayServerMessage, WorkerEventMessage } from "@pi/protocol";
import { WebSocket } from "ws";
import { afterEach, describe, expect, it } from "vitest";
import { startPiBackend, type PiBackendHandle } from "../src/index.js";

const require = createRequire(import.meta.url);
const tempDirectories: string[] = [];
const backends: PiBackendHandle[] = [];

afterEach(async () => {
  await Promise.all(backends.splice(0).map((backend) => backend.stop()));
  await Promise.all(tempDirectories.splice(0).map((path) => rm(path, { recursive: true, force: true })));
});

describe("PiGateway", () => {
  it("applies Express security and JSON error middleware", async () => {
    const directory = await mkdtemp(join(tmpdir(), "pi-ui-gateway-http-"));
    tempDirectories.push(directory);
    const backend = await startTestBackend(directory);

    const health = await fetch(`${backend.address.httpUrl}/health`);
    expect(health.status).toBe(200);
    expect(health.headers.get("x-powered-by")).toBeNull();

    const invalidJson = await fetch(`${backend.address.httpUrl}/v1/runtimes`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${backend.token}`,
        "content-type": "application/json"
      },
      body: "{"
    });
    expect(invalidJson.status).toBe(400);
    expect(await invalidJson.json()).toMatchObject({ error: { code: "invalid_json" } });

    const forbiddenOrigin = await fetch(`${backend.address.httpUrl}/v1/runtimes/missing`, {
      headers: {
        authorization: `Bearer ${backend.token}`,
        origin: "https://untrusted.example"
      }
    });
    expect(forbiddenOrigin.status).toBe(403);
    expect(await forbiddenOrigin.json()).toMatchObject({ error: { code: "origin_forbidden" } });
  });

  it("authenticates HTTP, controls a real Pi runtime, and streams events", async () => {
    const fixture = await createFixture();
    const backend = await startTestBackend(fixture.directory);
    const unauthorized = await fetch(`${backend.address.httpUrl}/v1/runtimes/missing`);
    expect(unauthorized.status).toBe(401);

    const createdResponse = await api(backend, "/v1/runtimes", {
      method: "POST",
      body: JSON.stringify({
        runtimeSlotId: "gateway-slot",
        cwd: fixture.workspace,
        agentDir: fixture.agentDir,
        sessionFile: fixture.sessionFile
      })
    });
    expect(createdResponse.status).toBe(201);
    const created = await createdResponse.json() as { sessionId: string; state: string };
    expect(created).toMatchObject({ sessionId: fixture.sessionId, state: "ready" });

    const renamedResponse = await api(backend, "/v1/runtimes/gateway-slot", {
      method: "PATCH",
      body: JSON.stringify({ sessionName: "Gateway session" })
    });
    expect(renamedResponse.status).toBe(200);
    expect(await renamedResponse.json()).toMatchObject({ sessionName: "Gateway session" });

    const socket = new WebSocket(
      backend.address.webSocketUrl,
      ["pi-ui.v1", `pi-ui-token.${backend.token}`]
    );
    const messages = createMessageQueue(socket);
    await messages.next((message) => message.kind === "connection.ready");
    socket.send(JSON.stringify({
      v: 1,
      kind: "subscribe",
      subscriptionId: "sub-1",
      runtimeSlotId: "gateway-slot"
    }));
    const ready = await messages.next((message) => message.kind === "subscription.ready");
    expect(ready).toMatchObject({ subscriptionId: "sub-1", runtimeSlotId: "gateway-slot" });

    const readyMessage = ready as Extract<GatewayServerMessage, { kind: "subscription.ready" }>;
    const liveEvent: WorkerEventMessage = {
      v: 1,
      kind: "event",
      streamId: readyMessage.streamId ?? "test-stream",
      cursor: (readyMessage.latestCursor ?? 0) + 1,
      runtimeSlotId: "gateway-slot",
      event: "test.live",
      payload: { value: 42 }
    };
    backend.eventStreams.append(liveEvent);
    expect(await messages.next((message) => message.kind === "runtime.event")).toMatchObject({
      subscriptionId: "sub-1",
      event: "test.live",
      payload: { value: 42 }
    });

    backend.eventStreams.append({
      ...liveEvent,
      cursor: liveEvent.cursor + 1,
      event: "test.replayed",
      payload: { value: 43 }
    });
    socket.send(JSON.stringify({
      v: 1,
      kind: "subscribe",
      subscriptionId: "sub-2",
      runtimeSlotId: "gateway-slot",
      resume: { streamId: liveEvent.streamId, afterCursor: liveEvent.cursor }
    }));
    await messages.next((message) => message.kind === "subscription.ready" && message.subscriptionId === "sub-2");
    expect(await messages.next((message) => message.kind === "runtime.event" && message.subscriptionId === "sub-2")).toMatchObject({
      cursor: liveEvent.cursor + 1,
      event: "test.replayed",
      payload: { value: 43 }
    });

    socket.close();
    await onceClosed(socket);
    const deleted = await api(backend, "/v1/runtimes/gateway-slot", { method: "DELETE" });
    expect(deleted.status).toBe(204);
  }, 30_000);
});

async function createFixture() {
  const directory = await mkdtemp(join(tmpdir(), "pi-ui-gateway-"));
  tempDirectories.push(directory);
  const workspace = join(directory, "workspace");
  const agentDir = join(directory, "agent");
  const sessionFile = join(directory, "session.jsonl");
  const sessionId = "019fc870-5931-7496-9099-99b884a0bf02";
  await mkdir(workspace, { recursive: true });
  await writeFile(sessionFile, `${JSON.stringify({
    type: "session",
    version: 3,
    id: sessionId,
    timestamp: new Date().toISOString(),
    cwd: workspace
  })}\n`, "utf8");
  return { directory, workspace, agentDir, sessionFile, sessionId };
}

async function startTestBackend(directory: string): Promise<PiBackendHandle> {
  const backend = await startPiBackend({
    dataDir: join(directory, "backend"),
    token: "gateway-test-token",
    workerEntry: fileURLToPath(new URL("../../agent-worker/src/main.ts", import.meta.url)),
    workerExecArgv: ["--import", require.resolve("tsx")]
  });
  backends.push(backend);
  return backend;
}

function api(backend: PiBackendHandle, path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${backend.address.httpUrl}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${backend.token}`,
      "content-type": "application/json",
      ...init.headers
    }
  });
}

function createMessageQueue(socket: WebSocket) {
  const buffered: GatewayServerMessage[] = [];
  const waiters = new Set<{
    predicate: (message: GatewayServerMessage) => boolean;
    resolve: (message: GatewayServerMessage) => void;
    reject: (error: Error) => void;
    timer: NodeJS.Timeout;
  }>();
  socket.on("message", (data) => {
    const message = JSON.parse(data.toString("utf8")) as GatewayServerMessage;
    const waiter = [...waiters].find((candidate) => candidate.predicate(message));
    if (!waiter) {
      buffered.push(message);
      return;
    }
    clearTimeout(waiter.timer);
    waiters.delete(waiter);
    waiter.resolve(message);
  });
  return {
    next(predicate: (message: GatewayServerMessage) => boolean, timeoutMs = 5_000) {
      const index = buffered.findIndex(predicate);
      if (index >= 0) return Promise.resolve(buffered.splice(index, 1)[0]);
      return new Promise<GatewayServerMessage>((resolve, reject) => {
        const waiter = {
          predicate,
          resolve,
          reject,
          timer: setTimeout(() => {
            waiters.delete(waiter);
            reject(new Error("Timed out waiting for WebSocket message"));
          }, timeoutMs)
        };
        waiters.add(waiter);
      });
    }
  };
}

function onceClosed(socket: WebSocket): Promise<void> {
  if (socket.readyState === WebSocket.CLOSED) return Promise.resolve();
  return new Promise((resolve) => socket.once("close", () => resolve()));
}
