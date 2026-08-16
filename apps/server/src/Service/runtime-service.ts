import { randomUUID } from "node:crypto";
import {
  bindHeadlessExtensions,
  createPiRuntime,
  createRuntimeSnapshot,
  mapPiEvent,
  toJsonValue,
  type AgentSessionRuntime,
} from "../Pi/runtime.js";
import type { CreateRuntimeRequestDto, JsonValue, PromptRuntimeRequestDto, RuntimeSnapshotDto, RuntimeEventDto } from "@pi/shared";
import type { RuntimeMapper } from "../Mapper/runtime-mapper.js";

export class RuntimeNotFoundError extends Error {
  constructor(readonly runtimeSlotId: string) {
    super(`Unknown runtime slot: ${runtimeSlotId}`);
    this.name = "RuntimeNotFoundError";
  }
}

interface ActiveRuntime {
  runtime: AgentSessionRuntime;
  unsubscribe?: () => void;
}

export class RuntimeService {
  #runtimes = new Map<string, ActiveRuntime>();
  constructor(
    private readonly runtimeMapper: RuntimeMapper,
    private readonly onEvent?: (event: RuntimeEventDto) => void,
  ) {}

  async create(input: CreateRuntimeRequestDto): Promise<RuntimeSnapshotDto> {
    const runtimeSlotId = input.runtimeSlotId ?? randomUUID();
    if (this.#runtimes.has(runtimeSlotId)) throw new Error(`Runtime slot already exists: ${runtimeSlotId}`);
    const runtime = await createPiRuntime(input);
    const active: ActiveRuntime = { runtime };
    try {
      await this.#bindSession(runtimeSlotId, active, runtime.session);
      this.#runtimes.set(runtimeSlotId, active);
      const snapshot = this.#snapshot(runtimeSlotId, active);
      this.runtimeMapper.save(snapshot);
      this.#emit(runtimeSlotId, "runtime.snapshot", toJsonValue(snapshot));
      return snapshot;
    } catch (error) {
      this.#runtimes.delete(runtimeSlotId);
      await runtime.dispose().catch(() => undefined);
      throw error;
    }
  }

  async get(runtimeSlotId: string): Promise<RuntimeSnapshotDto> {
    return this.#snapshot(runtimeSlotId, this.#require(runtimeSlotId));
  }

  async prompt(runtimeSlotId: string, input: PromptRuntimeRequestDto): Promise<RuntimeSnapshotDto> {
    const active = this.#require(runtimeSlotId);
    if (active.runtime.session.isStreaming && !input.streamingBehavior)
      throw new Error("streamingBehavior is required while the runtime is running");
    await active.runtime.session.prompt(input.message, { streamingBehavior: input.streamingBehavior });
    const snapshot = this.#snapshot(runtimeSlotId, active);
    this.runtimeMapper.save(snapshot);
    return snapshot;
  }

  async abort(runtimeSlotId: string): Promise<RuntimeSnapshotDto> {
    const active = this.#require(runtimeSlotId);
    await active.runtime.session.abort();
    const snapshot = this.#snapshot(runtimeSlotId, active);
    this.runtimeMapper.save(snapshot);
    return snapshot;
  }

  async rename(runtimeSlotId: string, sessionName: string): Promise<RuntimeSnapshotDto> {
    const active = this.#require(runtimeSlotId);
    active.runtime.session.setSessionName(sessionName);
    const snapshot = this.#snapshot(runtimeSlotId, active);
    this.runtimeMapper.save(snapshot);
    return snapshot;
  }

  async remove(runtimeSlotId: string): Promise<void> {
    const active = this.#require(runtimeSlotId);
    const failures: unknown[] = [];
    try {
      active.unsubscribe?.();
    } catch (error) {
      failures.push(error);
    }
    try {
      await active.runtime.session.abort();
    } catch (error) {
      failures.push(error);
    }
    try {
      await active.runtime.dispose();
    } catch (error) {
      failures.push(error);
    }
    this.#runtimes.delete(runtimeSlotId);
    try {
      this.runtimeMapper.delete(runtimeSlotId);
    } catch (error) {
      failures.push(error);
    }
    if (failures.length > 0) throw new AggregateError(failures, `Failed to fully remove runtime slot: ${runtimeSlotId}`);
  }

  async stopAll(): Promise<void> {
    const results = await Promise.allSettled([...this.#runtimes.keys()].map((id) => this.remove(id)));
    const failures = results.flatMap((result) => (result.status === "rejected" ? [result.reason] : []));
    if (failures.length > 0) throw new AggregateError(failures, "Failed to stop all runtime slots");
  }

  async #bindSession(runtimeSlotId: string, active: ActiveRuntime, session: AgentSessionRuntime["session"]): Promise<void> {
    active.unsubscribe?.();
    await bindHeadlessExtensions(session, (error) => this.#emit(runtimeSlotId, "extension.error", toJsonValue(error)));
    active.unsubscribe = session.subscribe((event) => {
      this.#emit(runtimeSlotId, "agent.event", mapPiEvent(event));
    });
  }

  #snapshot(runtimeSlotId: string, active: ActiveRuntime): RuntimeSnapshotDto {
    return createRuntimeSnapshot(runtimeSlotId, active.runtime);
  }
  #require(runtimeSlotId: string): ActiveRuntime {
    const active = this.#runtimes.get(runtimeSlotId);
    if (!active) throw new RuntimeNotFoundError(runtimeSlotId);
    return active;
  }
  #emit(runtimeSlotId: string, event: string, payload: JsonValue): void {
    this.onEvent?.({ runtimeSlotId, event, payload });
  }
}
