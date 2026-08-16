import { SocketClient, type RuntimeSubscription, type RuntimeSubscriptionListener } from "./socket-client";
import type { CreateRuntimeRequestDto, PromptRuntimeRequestDto, RuntimeSnapshotDto } from "@pi/shared";

export class RuntimeApi {
  constructor(private readonly client: SocketClient) {}

  create(input: CreateRuntimeRequestDto): Promise<RuntimeSnapshotDto> {
    return this.client.request("runtime:create", input);
  }

  get(runtimeSlotId: string): Promise<RuntimeSnapshotDto> {
    return this.client.request("runtime:get", { runtimeSlotId });
  }

  prompt(runtimeSlotId: string, input: PromptRuntimeRequestDto): Promise<RuntimeSnapshotDto> {
    return this.client.request("runtime:prompt", { runtimeSlotId, ...input }, 0);
  }

  abort(runtimeSlotId: string): Promise<RuntimeSnapshotDto> {
    return this.client.request("runtime:abort", { runtimeSlotId });
  }

  rename(runtimeSlotId: string, sessionName: string): Promise<RuntimeSnapshotDto> {
    return this.client.request("runtime:rename", { runtimeSlotId, sessionName });
  }

  async remove(runtimeSlotId: string): Promise<void> {
    await this.client.request<null>("runtime:remove", { runtimeSlotId });
  }

  subscribe(runtimeSlotId: string, listener: RuntimeSubscriptionListener): RuntimeSubscription {
    return this.client.subscribe(runtimeSlotId, listener);
  }
}
