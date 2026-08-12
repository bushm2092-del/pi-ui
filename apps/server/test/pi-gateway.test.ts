import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { io, type Socket } from "socket.io-client";
import { afterEach, describe, expect, it } from "vitest";
import type { ResultVO } from "@pi/shared";
import { startPiBackend, type PiBackendHandle } from "../src/index.js";

const cleanups: Array<() => Promise<void>> = [];

afterEach(async () => {
  await Promise.all(cleanups.splice(0).map((cleanup) => cleanup()));
});

describe("RuntimeController Socket.IO", () => {
  it("rejects an invalid token", async () => {
    const { backend, directory } = await startFixture();
    const socket = connect(backend.address.socketUrl, "wrong-token");
    cleanups.push(async () => {
      socket.disconnect();
      await backend.stop();
      await rm(directory, { recursive: true, force: true });
    });
    await expect(
      new Promise<void>((resolve, reject) => {
        socket.once("connect", resolve);
        socket.once("connect_error", reject);
      }),
    ).rejects.toThrow("unauthorized");
  });

  it("controls a real Pi runtime and streams watched events", async () => {
    const { backend, directory, workspace, agentDir, sessionFile } = await startFixture();
    const socket = connect(backend.address.socketUrl, backend.token);
    cleanups.push(async () => {
      socket.disconnect();
      await backend.stop();
      await rm(directory, { recursive: true, force: true });
    });
    await onceConnected(socket);

    const created = await emit<{ sessionId: string; state: string }>(socket, "runtime:create", {
      runtimeSlotId: "gateway-slot",
      cwd: workspace,
      agentDir,
      sessionFile,
    });
    expect(created).toMatchObject({ state: "ready" });

    const snapshot = await emit(socket, "runtime:watch", { runtimeSlotId: "gateway-slot" });
    expect(snapshot).toMatchObject({ runtimeSlotId: "gateway-slot" });
    const eventPromise = new Promise<Record<string, unknown>>((resolve) => socket.once("runtime:event", resolve));
    await emit(socket, "runtime:rename", { runtimeSlotId: "gateway-slot", sessionName: "Socket session" });
    expect(await eventPromise).toMatchObject({ runtimeSlotId: "gateway-slot", event: "agent.event" });
    await emit(socket, "runtime:remove", { runtimeSlotId: "gateway-slot" });
  }, 30_000);

  it("converts controller errors to the shared result contract", async () => {
    const { backend, directory } = await startFixture();
    const socket = connect(backend.address.socketUrl, backend.token);
    cleanups.push(async () => {
      socket.disconnect();
      await backend.stop();
      await rm(directory, { recursive: true, force: true });
    });
    await onceConnected(socket);

    const result = await emitResult(socket, "runtime:get", { runtimeSlotId: "missing-slot" });
    expect(result).toEqual({
      success: false,
      error: {
        code: "runtime_not_found",
        message: "Unknown runtime slot: missing-slot",
        retryable: false,
      },
    });
  });
});

async function startFixture() {
  const directory = await mkdtemp(join(tmpdir(), "pi-ui-socket-"));
  const workspace = join(directory, "workspace");
  const agentDir = join(directory, "agent");
  const sessionFile = join(directory, "session.jsonl");
  await mkdir(workspace, { recursive: true });
  await writeFile(
    sessionFile,
    `${JSON.stringify({
      type: "session",
      version: 3,
      id: "019fc870-5931-7496-9099-99b884a0bf02",
      timestamp: new Date().toISOString(),
      cwd: workspace,
    })}\n`,
    "utf8",
  );
  const backend = await startPiBackend({ dataDir: join(directory, "backend"), token: "socket-test-token" });
  return { backend, directory, workspace, agentDir, sessionFile };
}

function connect(url: string, token: string): Socket {
  return io(url.replace(/^ws/, "http"), { transports: ["websocket"], auth: { token }, forceNew: true });
}

function onceConnected(socket: Socket): Promise<void> {
  if (socket.connected) return Promise.resolve();
  return new Promise((resolve, reject) => {
    socket.once("connect", resolve);
    socket.once("connect_error", reject);
  });
}

function emit<T = unknown>(socket: Socket, event: string, payload: unknown): Promise<T> {
  return new Promise((resolve, reject) =>
    socket.emit(event, payload, (result: ResultVO<T>) => {
      if (result.success) resolve(result.data);
      else reject(new Error(result.error.message));
    }),
  );
}

function emitResult<T = unknown>(socket: Socket, event: string, payload: unknown): Promise<ResultVO<T>> {
  return new Promise((resolve) => socket.emit(event, payload, resolve));
}
