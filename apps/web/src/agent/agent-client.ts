import { io, type Socket } from "socket.io-client";
import type {
  CreateRuntimeRequestDto,
  JsonValue,
  PromptRuntimeRequestDto,
  ResultVO,
  RuntimeSnapshotDto,
  SidebarDto,
  SidebarConversationDto,
  SidebarProjectDto,
  ProjectConversationsDto,
  SyncConversationDto,
  UpsertProjectDto,
} from "@pi/shared";

export interface AgentBackendConnection {
  url: string;
  token: string;
}

export interface AgentClientOptions extends AgentBackendConnection {
  connectionTimeoutMs?: number;
}

export type RealtimeConnectionState = "idle" | "connecting" | "connected" | "reconnecting" | "closed";

export interface RuntimeEvent {
  runtimeSlotId: string;
  event: string;
  payload: JsonValue;
}

export interface RuntimeSubscriptionListener {
  onSnapshot?(snapshot: RuntimeSnapshotDto, reason: "synchronized" | "reset"): void;
  onEvent?(event: RuntimeEvent): void;
  onError?(error: AgentSocketError): void;
}

export class AgentSocketError extends Error {
  constructor(readonly code: string, message: string, readonly retryable: boolean) {
    super(message);
    this.name = "AgentSocketError";
  }
}

export class AgentClient {
  readonly runtimes: RuntimeCommands;
  readonly realtime: RuntimeRealtime;
  readonly projects: ProjectCommands;
  readonly conversations: ConversationCommands;
  readonly #socket: Socket;

  constructor(options: AgentClientOptions) {
    this.#socket = io(options.url.replace(/^ws/, "http"), {
      autoConnect: false,
      transports: ["websocket"],
      auth: { token: options.token },
      timeout: options.connectionTimeoutMs ?? 10_000,
    });
    this.runtimes = new RuntimeCommands(this.#socket);
    this.realtime = new RuntimeRealtime(this.#socket);
    this.projects = new ProjectCommands(this.#socket);
    this.conversations = new ConversationCommands(this.#socket);
  }

  close(): void {
    this.#socket.disconnect();
  }
}

export class ProjectCommands {
  constructor(private readonly socket: Socket) {}
  list(): Promise<SidebarProjectDto[]> { return request(this.socket, "project:list", null); }
  upsert(input: UpsertProjectDto): Promise<SidebarProjectDto> { return request(this.socket, "project:upsert", input); }
}

export class ConversationCommands {
  constructor(private readonly socket: Socket) {}
  list(): Promise<Pick<SidebarDto, "pinned" | "recent">> { return request(this.socket, "conversation:list", null); }
  sync(input: SyncConversationDto): Promise<SidebarConversationDto> { return request(this.socket, "conversation:sync", input); }
  listByProject(input: ProjectConversationsDto): Promise<SidebarConversationDto[]> { return request(this.socket, "conversation:listByProject", input); }
  pin(conversationId: string, pinned: boolean): Promise<void> { return request(this.socket, "conversation:pin", { conversationId, pinned }); }
  archive(conversationId: string): Promise<void> { return request(this.socket, "conversation:archive", { conversationId }); }
  markRead(conversationId: string): Promise<void> { return request(this.socket, "conversation:read", { conversationId }); }
}

export class RuntimeCommands {
  constructor(private readonly socket: Socket) {}

  create(input: CreateRuntimeRequestDto, _signal?: AbortSignal): Promise<RuntimeSnapshotDto> {
    return request(this.socket, "runtime:create", input);
  }

  get(runtimeSlotId: string, _signal?: AbortSignal): Promise<RuntimeSnapshotDto> {
    return request(this.socket, "runtime:get", { runtimeSlotId });
  }

  prompt(runtimeSlotId: string, input: PromptRuntimeRequestDto, _signal?: AbortSignal): Promise<RuntimeSnapshotDto> {
    return request(this.socket, "runtime:prompt", { runtimeSlotId, ...input }, 0);
  }

  abort(runtimeSlotId: string, _signal?: AbortSignal): Promise<RuntimeSnapshotDto> {
    return request(this.socket, "runtime:abort", { runtimeSlotId });
  }

  rename(runtimeSlotId: string, sessionName: string, _signal?: AbortSignal): Promise<RuntimeSnapshotDto> {
    return request(this.socket, "runtime:rename", { runtimeSlotId, sessionName });
  }

  async remove(runtimeSlotId: string, _signal?: AbortSignal): Promise<void> {
    await request(this.socket, "runtime:remove", { runtimeSlotId });
  }
}

export class RuntimeRealtime {
  #state: RealtimeConnectionState = "idle";
  #stateListeners = new Set<(state: RealtimeConnectionState) => void>();
  #subscriptions = new Map<string, Set<RuntimeSubscriptionListener>>();

  constructor(private readonly socket: Socket) {
    socket.on("connect", () => {
      this.#setState("connected");
      void this.#restoreSubscriptions();
    });
    socket.on("disconnect", (reason) => {
      this.#setState(reason === "io client disconnect" ? "closed" : "reconnecting");
    });
    socket.on("connect_error", (error) => {
      const socketError = new AgentSocketError("connection_failed", error.message, true);
      for (const listeners of this.#subscriptions.values()) {
        for (const listener of listeners) listener.onError?.(socketError);
      }
    });
    socket.on("runtime:event", (event: RuntimeEvent) => {
      for (const listener of this.#subscriptions.get(event.runtimeSlotId) ?? []) listener.onEvent?.(event);
    });
  }

  get state(): RealtimeConnectionState { return this.#state; }

  connect(): Promise<void> {
    if (this.socket.connected) return Promise.resolve();
    this.#setState(this.#state === "idle" ? "connecting" : "reconnecting");
    this.socket.connect();
    return new Promise((resolve, reject) => {
      const onConnect = () => { cleanup(); resolve(); };
      const onError = (error: Error) => { cleanup(); reject(new AgentSocketError("connection_failed", error.message, true)); };
      const cleanup = () => {
        this.socket.off("connect", onConnect);
        this.socket.off("connect_error", onError);
      };
      this.socket.once("connect", onConnect);
      this.socket.once("connect_error", onError);
    });
  }

  close(): void { this.socket.disconnect(); }

  onStateChange(listener: (state: RealtimeConnectionState) => void): () => void {
    this.#stateListeners.add(listener);
    return () => this.#stateListeners.delete(listener);
  }

  subscribe(runtimeSlotId: string, listener: RuntimeSubscriptionListener): { subscriptionId: string; unsubscribe(): void } {
    const listeners = this.#subscriptions.get(runtimeSlotId) ?? new Set();
    listeners.add(listener);
    this.#subscriptions.set(runtimeSlotId, listeners);
    if (this.socket.connected) void this.#watch(runtimeSlotId, listener, "synchronized");
    return {
      subscriptionId: globalThis.crypto.randomUUID(),
      unsubscribe: () => {
        listeners.delete(listener);
        if (listeners.size) return;
        this.#subscriptions.delete(runtimeSlotId);
        if (this.socket.connected) this.socket.emit("runtime:unwatch", { runtimeSlotId });
      },
    };
  }

  async #restoreSubscriptions(): Promise<void> {
    await Promise.all([...this.#subscriptions.entries()].map(async ([runtimeSlotId, listeners]) => {
      try {
        const snapshot = await request<RuntimeSnapshotDto>(this.socket, "runtime:watch", { runtimeSlotId });
        for (const listener of listeners) listener.onSnapshot?.(snapshot, "reset");
      } catch (error) {
        for (const listener of listeners) listener.onError?.(toSocketError(error));
      }
    }));
  }

  async #watch(runtimeSlotId: string, listener: RuntimeSubscriptionListener, reason: "synchronized" | "reset"): Promise<void> {
    try {
      listener.onSnapshot?.(await request(this.socket, "runtime:watch", { runtimeSlotId }), reason);
    } catch (error) {
      listener.onError?.(toSocketError(error));
    }
  }

  #setState(state: RealtimeConnectionState): void {
    if (state === this.#state) return;
    this.#state = state;
    for (const listener of this.#stateListeners) listener(state);
  }
}

async function request<T>(socket: Socket, event: string, payload: unknown, timeoutMs = 30_000): Promise<T> {
  await ensureConnected(socket);
  return new Promise<T>((resolve, reject) => {
    const ack = (result: ResultVO<T>) => {
      if (result.success) resolve(result.data);
      else reject(new AgentSocketError(result.error.code, result.error.message, result.error.retryable));
    };
    if (timeoutMs > 0) {
      socket.timeout(timeoutMs).emit(event, payload, (error: Error | null, result: ResultVO<T>) => {
        if (error) reject(new AgentSocketError("request_timeout", `${event} timed out`, true));
        else ack(result);
      });
    } else {
      socket.emit(event, payload, ack);
    }
  });
}

function ensureConnected(socket: Socket): Promise<void> {
  if (socket.connected) return Promise.resolve();
  socket.connect();
  return new Promise((resolve, reject) => {
    const onConnect = () => { cleanup(); resolve(); };
    const onError = (error: Error) => {
      cleanup();
      reject(new AgentSocketError("connection_failed", error.message, true));
    };
    const cleanup = () => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onError);
    };
    socket.once("connect", onConnect);
    socket.once("connect_error", onError);
  });
}

function toSocketError(error: unknown): AgentSocketError {
  return error instanceof AgentSocketError
    ? error
    : new AgentSocketError("socket_error", error instanceof Error ? error.message : String(error), false);
}
