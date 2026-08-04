import type {
  CreateRuntimeRequestDto,
  PromptRuntimeRequestDto,
  RuntimeSnapshotDto
} from "@pi/protocol";
import { AgentWorkerSupervisor } from "../../supervisors/agent-worker-supervisor.js";

export class RuntimeNotFoundError extends Error {
  constructor(readonly runtimeSlotId: string) {
    super(`Unknown runtime slot: ${runtimeSlotId}`);
    this.name = "RuntimeNotFoundError";
  }
}

export class RuntimeService {
  constructor(private readonly supervisor: AgentWorkerSupervisor) {}

  create(input: CreateRuntimeRequestDto): Promise<RuntimeSnapshotDto> {
    return this.supervisor.startRuntime(input);
  }

  async get(runtimeSlotId: string): Promise<RuntimeSnapshotDto> {
    this.#assertExists(runtimeSlotId);
    return this.supervisor.getSnapshot(runtimeSlotId);
  }

  prompt(runtimeSlotId: string, input: PromptRuntimeRequestDto): Promise<RuntimeSnapshotDto> {
    this.#assertExists(runtimeSlotId);
    return this.supervisor.prompt(runtimeSlotId, input.message, input.streamingBehavior);
  }

  abort(runtimeSlotId: string): Promise<RuntimeSnapshotDto> {
    this.#assertExists(runtimeSlotId);
    return this.supervisor.abort(runtimeSlotId);
  }

  rename(runtimeSlotId: string, sessionName: string): Promise<RuntimeSnapshotDto> {
    this.#assertExists(runtimeSlotId);
    return this.supervisor.setSessionName(runtimeSlotId, sessionName);
  }

  async remove(runtimeSlotId: string): Promise<void> {
    this.#assertExists(runtimeSlotId);
    await this.supervisor.stopRuntime(runtimeSlotId);
  }

  #assertExists(runtimeSlotId: string): void {
    if (!this.supervisor.registry.getBySlot(runtimeSlotId)) throw new RuntimeNotFoundError(runtimeSlotId);
  }
}
