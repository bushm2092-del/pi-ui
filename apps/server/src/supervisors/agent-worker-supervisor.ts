import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import type { RuntimeSnapshotDto, WorkerEventMessage } from "@pi/protocol";
import { isRuntimeSnapshotDto } from "@pi/protocol";
import { JsonlOperationJournal } from "../core/operation-journal.js";
import { SessionRuntimeRegistry } from "../core/session-runtime-registry.js";
import { StorageLeaseManager, type StorageLease } from "../core/storage-lease-manager.js";
import { AgentWorkerProcess, WorkerOperationError } from "./agent-worker-process.js";

export interface AgentWorkerSupervisorOptions {
  workerEntry?: string;
  workerExecArgv?: string[];
  journal: JsonlOperationJournal;
  leases?: StorageLeaseManager;
  registry?: SessionRuntimeRegistry;
  onEvent?: (event: WorkerEventMessage) => void;
  onWorkerStderr?: (runtimeSlotId: string, text: string) => void;
}

interface ManagedRuntime {
  process: AgentWorkerProcess;
  lease: StorageLease;
}

export class AgentWorkerSupervisor {
  readonly leases: StorageLeaseManager;
  readonly registry: SessionRuntimeRegistry;
  #runtimes = new Map<string, ManagedRuntime>();

  constructor(private readonly options: AgentWorkerSupervisorOptions) {
    this.leases = options.leases ?? new StorageLeaseManager();
    this.registry = options.registry ?? new SessionRuntimeRegistry();
  }

  async startRuntime(input: {
    runtimeSlotId?: string;
    cwd: string;
    agentDir?: string;
    sessionFile?: string;
  }): Promise<RuntimeSnapshotDto> {
    const runtimeSlotId = input.runtimeSlotId ?? randomUUID();
    if (this.#runtimes.has(runtimeSlotId)) throw new Error(`Runtime slot already exists: ${runtimeSlotId}`);
    const initialResourceKey = input.sessionFile
      ? sessionResourceKey(input.sessionFile)
      : `provisional:${runtimeSlotId}`;
    let lease = this.leases.acquire(initialResourceKey, runtimeSlotId);
    const process = new AgentWorkerProcess({
      entry: this.options.workerEntry ?? resolveDefaultWorkerEntry(),
      execArgv: this.options.workerExecArgv,
      onStderr: (text) => this.options.onWorkerStderr?.(runtimeSlotId, text)
    });
    process.onEvent((event) => this.options.onEvent?.(event));
    process.onExit(() => this.#handleUnexpectedExit(runtimeSlotId, process));
    this.#runtimes.set(runtimeSlotId, { process, lease });

    try {
      await process.start();
      const operationId = randomUUID();
      const data = await process.execute("runtime.initialize", {
        runtimeSlotId,
        cwd: input.cwd,
        agentDir: input.agentDir,
        sessionFile: input.sessionFile
      }, operationId);
      if (!isRuntimeSnapshotDto(data)) throw new Error("Agent worker returned an invalid runtime snapshot");
      const snapshot = data;
      if (snapshot.sessionFile) {
        lease = this.leases.transfer(lease, sessionResourceKey(snapshot.sessionFile));
        this.#runtimes.set(runtimeSlotId, { process, lease });
      }
      this.registry.register({ runtimeSlotId, workerId: process.workerId, snapshot, storageLease: lease });
      return snapshot;
    } catch (error) {
      this.#runtimes.delete(runtimeSlotId);
      try {
        this.leases.release(lease);
      } catch {
        // An early worker exit may have already released the lease.
      }
      await process.stop(randomUUID()).catch(() => undefined);
      throw error;
    }
  }

  async prompt(
    runtimeSlotId: string,
    message: string,
    streamingBehavior?: "steer" | "followUp"
  ): Promise<RuntimeSnapshotDto> {
    const managed = this.#requireRuntime(runtimeSlotId);
    const operationId = randomUUID();
    await this.options.journal.accept(operationId, runtimeSlotId, "runtime.prompt");
    await this.options.journal.transition(operationId, "running");
    try {
      const data = await managed.process.execute("runtime.prompt", { message, streamingBehavior }, operationId);
      if (!isRuntimeSnapshotDto(data)) throw new Error("Agent worker returned an invalid runtime snapshot");
      const snapshot = data;
      this.registry.update(runtimeSlotId, snapshot);
      await this.options.journal.transition(operationId, "completed", { result: data });
      return snapshot;
    } catch (error) {
      const uncertain = error instanceof Error && error.message.startsWith("worker_exited:");
      await this.options.journal.transition(operationId, uncertain ? "uncertain" : "failed", {
        error: {
          code: error instanceof WorkerOperationError ? error.details.code : uncertain ? "worker_exited" : "operation_failed",
          message: error instanceof Error ? error.message : String(error)
        }
      });
      throw error;
    }
  }

  async getSnapshot(runtimeSlotId: string): Promise<RuntimeSnapshotDto> {
    const managed = this.#requireRuntime(runtimeSlotId);
    const data = await managed.process.execute("runtime.get_snapshot", {}, randomUUID());
    if (!isRuntimeSnapshotDto(data)) throw new Error("Agent worker returned an invalid runtime snapshot");
    this.registry.update(runtimeSlotId, data);
    return data;
  }

  async abort(runtimeSlotId: string): Promise<RuntimeSnapshotDto> {
    const managed = this.#requireRuntime(runtimeSlotId);
    const operationId = randomUUID();
    const data = await managed.process.execute("runtime.abort", {}, operationId);
    if (!isRuntimeSnapshotDto(data)) throw new Error("Agent worker returned an invalid runtime snapshot");
    this.registry.update(runtimeSlotId, data);
    return data;
  }

  async setSessionName(runtimeSlotId: string, name: string): Promise<RuntimeSnapshotDto> {
    const managed = this.#requireRuntime(runtimeSlotId);
    const operationId = randomUUID();
    const data = await managed.process.execute("runtime.set_session_name", { name }, operationId);
    if (!isRuntimeSnapshotDto(data)) throw new Error("Agent worker returned an invalid runtime snapshot");
    this.registry.update(runtimeSlotId, data);
    return data;
  }

  async stopRuntime(runtimeSlotId: string): Promise<void> {
    const managed = this.#runtimes.get(runtimeSlotId);
    if (!managed) return;
    this.#runtimes.delete(runtimeSlotId);
    this.registry.remove(runtimeSlotId);
    try {
      await managed.process.stop(randomUUID());
    } finally {
      this.leases.release(managed.lease);
    }
  }

  async stopAll(): Promise<void> {
    await Promise.all([...this.#runtimes.keys()].map((runtimeSlotId) => this.stopRuntime(runtimeSlotId)));
  }

  #requireRuntime(runtimeSlotId: string): ManagedRuntime {
    const runtime = this.#runtimes.get(runtimeSlotId);
    if (!runtime) throw new Error(`Unknown runtime slot: ${runtimeSlotId}`);
    return runtime;
  }

  #handleUnexpectedExit(runtimeSlotId: string, process: AgentWorkerProcess): void {
    const managed = this.#runtimes.get(runtimeSlotId);
    if (!managed || managed.process !== process) return;
    this.#runtimes.delete(runtimeSlotId);
    this.registry.remove(runtimeSlotId);
    try {
      this.leases.release(managed.lease);
    } catch {
      // A concurrent orderly stop may already have released the lease.
    }
  }
}

function resolveDefaultWorkerEntry(): string {
  return createRequire(import.meta.url).resolve("@pi/agent-worker/entry");
}

function sessionResourceKey(sessionFile: string): string {
  return `session:${resolve(sessionFile)}`;
}
