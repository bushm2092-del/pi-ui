import { randomUUID } from "node:crypto";
import {
  type AgentSession,
  type AgentSessionRuntime,
  bindHeadlessExtensions,
  createPiRuntime,
  createRuntimeSnapshot,
  mapPiEvent,
  toJsonValue
} from "@pi/pi-adapter";
import {
  IPC_PROTOCOL_VERSION,
  type JsonValue,
  type RuntimeSlotState,
  type RuntimeSnapshotDto,
  type WorkerEventMessage
} from "@pi/protocol";

export type RuntimeEventPublisher = (event: WorkerEventMessage) => void;

export class RuntimeSlotError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly retryable = false
  ) {
    super(message);
    this.name = "RuntimeSlotError";
  }
}

export class RuntimeSlot {
  readonly streamId = randomUUID();
  #runtimeSlotId?: string;
  #runtime?: AgentSessionRuntime;
  #state: RuntimeSlotState = "stopped";
  #cursor = 0;
  #unsubscribe?: () => void;
  #lifecycle = Promise.resolve();

  constructor(private readonly publish: RuntimeEventPublisher) {}

  get state(): RuntimeSlotState {
    return this.#state;
  }

  async initialize(options: {
    runtimeSlotId: string;
    cwd: string;
    agentDir?: string;
    sessionFile?: string;
  }): Promise<RuntimeSnapshotDto> {
    return this.#withLifecycleLock(async () => {
      if (this.#runtime || this.#state !== "stopped") {
        throw new RuntimeSlotError("runtime_already_initialized", "Runtime slot is already initialized");
      }
      this.#runtimeSlotId = options.runtimeSlotId;
      this.#setState("starting");
      try {
        const runtime = await createPiRuntime(options);
        this.#runtime = runtime;
        runtime.setRebindSession(async (session) => this.#bindSession(session));
        await this.#bindSession(runtime.session);
        this.#setState("ready");
        const snapshot = this.snapshot();
        this.#emit("runtime.snapshot", toJsonValue(snapshot));
        return snapshot;
      } catch (error) {
        this.#setState("unavailable");
        throw error;
      }
    });
  }

  snapshot(): RuntimeSnapshotDto {
    const runtime = this.#requireRuntime();
    return createRuntimeSnapshot(this.#requireRuntimeSlotId(), runtime, this.#state);
  }

  async prompt(
    operationId: string,
    message: string,
    streamingBehavior?: "steer" | "followUp"
  ): Promise<RuntimeSnapshotDto> {
    const runtime = this.#requireRuntime();
    if (this.#state !== "ready" && this.#state !== "running") {
      throw new RuntimeSlotError("runtime_not_ready", `Cannot prompt while runtime is ${this.#state}`, true);
    }
    if (this.#state === "running" && !streamingBehavior) {
      throw new RuntimeSlotError(
        "streaming_behavior_required",
        "streamingBehavior is required while the runtime is running"
      );
    }

    if (this.#state === "ready") this.#setState("running");
    try {
      await runtime.session.prompt(message, {
        streamingBehavior,
        preflightResult: (accepted) => {
          this.#emit("operation.accepted", { operationId, accepted });
        }
      });
      return this.snapshot();
    } finally {
      if (this.#runtime && !this.#runtime.session.isStreaming && this.#state === "running") {
        this.#setState("ready");
      }
    }
  }

  async abort(): Promise<RuntimeSnapshotDto> {
    const runtime = this.#requireRuntime();
    await runtime.session.abort();
    if (!runtime.session.isStreaming && this.#state === "running") this.#setState("ready");
    return this.snapshot();
  }

  setSessionName(name: string): RuntimeSnapshotDto {
    if (this.#state !== "ready") {
      throw new RuntimeSlotError("runtime_not_ready", `Cannot rename session while runtime is ${this.#state}`, true);
    }
    this.#requireRuntime().session.setSessionName(name);
    return this.snapshot();
  }

  async shutdown(): Promise<void> {
    await this.#withLifecycleLock(async () => {
      if (!this.#runtime) {
        if (this.#state !== "stopped") this.#setState("stopped");
        return;
      }
      this.#setState("stopping");
      const runtime = this.#runtime;
      this.#runtime = undefined;
      this.#unsubscribe?.();
      this.#unsubscribe = undefined;
      await runtime.session.abort();
      await runtime.dispose();
      this.#setState("stopped");
    });
  }

  async #bindSession(session: AgentSession): Promise<void> {
    this.#unsubscribe?.();
    await bindHeadlessExtensions(session, (error) => {
      this.#emit("extension.error", toJsonValue(error));
    });
    this.#unsubscribe = session.subscribe((event) => {
      if (event.type === "agent_start" && this.#state === "ready") this.#setState("running");
      if (event.type === "agent_settled" && this.#state === "running") this.#setState("ready");
      this.#emit("agent.event", mapPiEvent(event));
    });
  }

  #setState(state: RuntimeSlotState): void {
    if (this.#state === state) return;
    const previous = this.#state;
    this.#state = state;
    if (this.#runtimeSlotId) this.#emit("runtime.phase", { previous, state });
  }

  #emit(event: string, payload: JsonValue): void {
    this.publish({
      v: IPC_PROTOCOL_VERSION,
      kind: "event",
      streamId: this.streamId,
      cursor: ++this.#cursor,
      runtimeSlotId: this.#runtimeSlotId,
      event,
      payload
    });
  }

  #requireRuntime(): AgentSessionRuntime {
    if (!this.#runtime) throw new RuntimeSlotError("runtime_not_initialized", "Runtime slot is not initialized");
    return this.#runtime;
  }

  #requireRuntimeSlotId(): string {
    if (!this.#runtimeSlotId) throw new RuntimeSlotError("runtime_not_initialized", "Runtime slot has no identity");
    return this.#runtimeSlotId;
  }

  async #withLifecycleLock<T>(operation: () => Promise<T>): Promise<T> {
    const previous = this.#lifecycle;
    let release!: () => void;
    this.#lifecycle = new Promise<void>((resolve) => { release = resolve; });
    await previous;
    try {
      return await operation();
    } finally {
      release();
    }
  }
}
