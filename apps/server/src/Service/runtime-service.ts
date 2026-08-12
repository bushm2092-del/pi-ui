import { randomUUID } from "node:crypto";
import {
  bindHeadlessExtensions,
  createPiRuntime,
  createRuntimeSnapshot,
  mapPiEvent,
  toJsonValue,
  type AgentSessionRuntime,
} from "../Pi/runtime.js";
import type {
  CreateRuntimeRequestDto,
  JsonValue,
  PromptRuntimeRequestDto,
  RuntimeSlotState,
  RuntimeSnapshotDto,
  RuntimeEventDto,
} from "@pi/shared";
import type { RuntimeMapper } from "../Mapper/runtime-mapper.js";

export class RuntimeNotFoundError extends Error {
  constructor(readonly runtimeSlotId: string) {
    super(`Unknown runtime slot: ${runtimeSlotId}`);
    this.name = "RuntimeNotFoundError";
  }
}

interface ActiveRuntime {
  runtime: AgentSessionRuntime;
  state: RuntimeSlotState;
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
    const active: ActiveRuntime = { runtime, state: "starting" };
    this.#runtimes.set(runtimeSlotId, active);
    try {
      runtime.setRebindSession(async (session) => this.#bindSession(runtimeSlotId, active, session));
      await this.#bindSession(runtimeSlotId, active, runtime.session);
      this.#setState(runtimeSlotId, active, "ready");
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
    if (active.state !== "ready" && active.state !== "running") throw new Error(`Cannot prompt while runtime is ${active.state}`);
    if (active.state === "running" && !input.streamingBehavior)
      throw new Error("streamingBehavior is required while the runtime is running");
    if (active.state === "ready") this.#setState(runtimeSlotId, active, "running");
    try {
      await active.runtime.session.prompt(input.message, { streamingBehavior: input.streamingBehavior });
      const snapshot = this.#snapshot(runtimeSlotId, active);
      this.runtimeMapper.save(snapshot);
      return snapshot;
    } finally {
      if (!active.runtime.session.isStreaming && active.state === "running") this.#setState(runtimeSlotId, active, "ready");
    }
  }

  async abort(runtimeSlotId: string): Promise<RuntimeSnapshotDto> {
    const active = this.#require(runtimeSlotId);
    await active.runtime.session.abort();
    if (!active.runtime.session.isStreaming) this.#setState(runtimeSlotId, active, "ready");
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
    this.#runtimes.delete(runtimeSlotId);
    active.unsubscribe?.();
    await active.runtime.session.abort();
    await active.runtime.dispose();
    this.runtimeMapper.delete(runtimeSlotId);
  }

  async stopAll(): Promise<void> {
    await Promise.all([...this.#runtimes.keys()].map((id) => this.remove(id)));
  }

  async #bindSession(runtimeSlotId: string, active: ActiveRuntime, session: AgentSessionRuntime["session"]): Promise<void> {
    active.unsubscribe?.();
    await bindHeadlessExtensions(session, (error) => this.#emit(runtimeSlotId, "extension.error", toJsonValue(error)));
    active.unsubscribe = session.subscribe((event) => {
      if (event.type === "agent_start") this.#setState(runtimeSlotId, active, "running");
      if (event.type === "agent_settled") this.#setState(runtimeSlotId, active, "ready");
      this.#emit(runtimeSlotId, "agent.event", mapPiEvent(event));
    });
  }

  #snapshot(runtimeSlotId: string, active: ActiveRuntime): RuntimeSnapshotDto {
    return createRuntimeSnapshot(runtimeSlotId, active.runtime, active.state);
  }
  #require(runtimeSlotId: string): ActiveRuntime {
    const active = this.#runtimes.get(runtimeSlotId);
    if (!active) throw new RuntimeNotFoundError(runtimeSlotId);
    return active;
  }
  #setState(runtimeSlotId: string, active: ActiveRuntime, state: RuntimeSlotState): void {
    if (active.state === state) return;
    const previous = active.state;
    active.state = state;
    this.#emit(runtimeSlotId, "runtime.phase", { previous, state });
  }
  #emit(runtimeSlotId: string, event: string, payload: JsonValue): void {
    this.onEvent?.({ runtimeSlotId, event, payload });
  }
}
