import { IPC_PROTOCOL_VERSION } from "@pi/protocol";
import { WorkerHost } from "./ipc/worker-host.js";

function send(message: Parameters<NonNullable<typeof process.send>>[0]): void {
  if (process.connected && process.send) process.send(message);
}

const host = new WorkerHost((message) => send(message));

process.on("message", (message) => {
  void host.receive(message);
});

let shuttingDown = false;
async function shutdown(exitCode = 0): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  try {
    await host.dispose();
  } finally {
    process.exit(exitCode);
  }
}

process.on("disconnect", () => { void shutdown(); });
process.on("SIGTERM", () => { void shutdown(); });
process.on("SIGINT", () => { void shutdown(); });
process.on("uncaughtException", (error) => {
  send({
    v: IPC_PROTOCOL_VERSION,
    kind: "event",
    streamId: `worker:${host.workerId}`,
    cursor: 1,
    event: "worker.fatal",
    payload: { name: error.name, message: error.message, stack: error.stack ?? "" }
  });
  void shutdown(1);
});
process.on("unhandledRejection", (reason) => {
  const error = reason instanceof Error ? reason : new Error(String(reason));
  send({
    v: IPC_PROTOCOL_VERSION,
    kind: "event",
    streamId: `worker:${host.workerId}`,
    cursor: 1,
    event: "worker.fatal",
    payload: { name: error.name, message: error.message, stack: error.stack ?? "" }
  });
  void shutdown(1);
});

host.startHeartbeat();
send({ v: IPC_PROTOCOL_VERSION, kind: "ready", workerId: host.workerId, pid: process.pid });
