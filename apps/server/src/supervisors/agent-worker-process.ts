import { fork, type ChildProcess } from "node:child_process";
import type {
  JsonValue,
  ProtocolErrorDto,
  WorkerCommandMethod,
  WorkerCommandPayloads,
  WorkerEventMessage
} from "@pi/protocol";
import { createWorkerCommand, parseWorkerToControlMessage } from "@pi/protocol";

interface PendingOperation {
  resolve(value: JsonValue | undefined): void;
  reject(error: Error): void;
}

export interface AgentWorkerProcessOptions {
  entry: string;
  execArgv?: string[];
  heartbeatTimeoutMs?: number;
  onStderr?: (text: string) => void;
}

export class WorkerOperationError extends Error {
  constructor(readonly details: ProtocolErrorDto) {
    super(details.message);
    this.name = "WorkerOperationError";
  }
}

export class AgentWorkerProcess {
  #child?: ChildProcess;
  #workerId?: string;
  #pending = new Map<string, PendingOperation>();
  #eventListeners = new Set<(event: WorkerEventMessage) => void>();
  #exitListeners = new Set<(error: Error) => void>();
  #ready?: Promise<string>;
  #lastHeartbeat = 0;
  #heartbeatMonitor?: NodeJS.Timeout;

  constructor(private readonly options: AgentWorkerProcessOptions) {}

  get workerId(): string {
    if (!this.#workerId) throw new Error("Agent worker has not completed its handshake");
    return this.#workerId;
  }

  async start(timeoutMs = 30_000): Promise<string> {
    if (this.#child) throw new Error("Agent worker is already started");
    const child = fork(this.options.entry, [], {
      execArgv: this.options.execArgv ?? [],
      stdio: ["ignore", "ignore", "pipe", "ipc"]
    });
    this.#child = child;
    child.stderr?.on("data", (chunk) => this.options.onStderr?.(String(chunk)));
    child.on("message", (value) => this.#handleMessage(value));
    child.on("error", (error) => this.#handleExit(error));
    child.on("exit", (code, signal) => {
      this.#handleExit(new Error(`Agent worker exited (code=${String(code)}, signal=${String(signal)})`));
    });

    this.#ready = new Promise<string>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("Timed out waiting for agent worker handshake")), timeoutMs);
      timer.unref();
      const onReady = (message: WorkerEventMessage) => {
        if (message.event !== "worker.internal_ready") return;
        clearTimeout(timer);
        this.#eventListeners.delete(onReady);
        resolve(this.workerId);
      };
      this.#eventListeners.add(onReady);
      this.#exitListeners.add(reject);
    });

    this.#heartbeatMonitor = setInterval(() => {
      if (this.#lastHeartbeat && Date.now() - this.#lastHeartbeat > (this.options.heartbeatTimeoutMs ?? 15_000)) {
        this.#child?.kill("SIGTERM");
      }
    }, 5_000);
    this.#heartbeatMonitor.unref();
    return this.#ready;
  }

  onEvent(listener: (event: WorkerEventMessage) => void): () => void {
    this.#eventListeners.add(listener);
    return () => this.#eventListeners.delete(listener);
  }

  onExit(listener: (error: Error) => void): () => void {
    this.#exitListeners.add(listener);
    return () => this.#exitListeners.delete(listener);
  }

  async execute<M extends WorkerCommandMethod>(
    method: M,
    payload: WorkerCommandPayloads[M],
    operationId: string
  ): Promise<JsonValue | undefined> {
    const child = this.#child;
    if (!child?.connected) throw new Error("Agent worker is not connected");
    await this.#ready;
    const command = createWorkerCommand(method, payload, operationId);
    return new Promise<JsonValue | undefined>((resolve, reject) => {
      this.#pending.set(operationId, { resolve, reject });
      child.send(command, (error) => {
        if (!error) return;
        this.#pending.delete(operationId);
        reject(error);
      });
    });
  }

  async stop(operationId: string, timeoutMs = 10_000): Promise<void> {
    const child = this.#child;
    if (!child) return;
    try {
      if (child.connected) await this.execute("runtime.shutdown", {}, operationId);
    } finally {
      if (child.connected) child.disconnect();
      await waitForExit(child, timeoutMs);
      this.#clearHeartbeatMonitor();
      this.#child = undefined;
    }
  }

  #handleMessage(value: unknown): void {
    let message;
    try {
      message = parseWorkerToControlMessage(value);
    } catch (error) {
      this.options.onStderr?.(`Invalid agent worker message: ${String(error)}\n`);
      return;
    }
    if (message.kind === "ready") {
      this.#workerId = message.workerId;
      this.#lastHeartbeat = Date.now();
      const readyEvent: WorkerEventMessage = {
        v: 1,
        kind: "event",
        streamId: `worker:${message.workerId}`,
        cursor: 0,
        event: "worker.internal_ready",
        payload: { pid: message.pid }
      };
      for (const listener of this.#eventListeners) listener(readyEvent);
      return;
    }
    if (message.kind === "heartbeat") {
      this.#lastHeartbeat = Date.now();
      return;
    }
    if (message.kind === "event") {
      for (const listener of this.#eventListeners) listener(message);
      return;
    }
    const pending = this.#pending.get(message.operationId);
    if (!pending) return;
    this.#pending.delete(message.operationId);
    if (message.ok) pending.resolve(message.data);
    else pending.reject(new WorkerOperationError(message.error!));
  }

  #handleExit(error: Error): void {
    if (!this.#child) return;
    this.#clearHeartbeatMonitor();
    this.#child = undefined;
    const wrapped = new Error(`worker_exited: ${error.message}`);
    for (const pending of this.#pending.values()) pending.reject(wrapped);
    this.#pending.clear();
    for (const listener of this.#exitListeners) listener(wrapped);
  }

  #clearHeartbeatMonitor(): void {
    if (!this.#heartbeatMonitor) return;
    clearInterval(this.#heartbeatMonitor);
    this.#heartbeatMonitor = undefined;
  }
}

async function waitForExit(child: ChildProcess, timeoutMs: number): Promise<void> {
  if (child.exitCode !== null || child.signalCode !== null) return;
  await new Promise<void>((resolve) => {
    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      resolve();
    }, timeoutMs);
    timer.unref();
    child.once("exit", () => {
      clearTimeout(timer);
      resolve();
    });
  });
}
