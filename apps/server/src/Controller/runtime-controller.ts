import type { CreateRuntimeRequestDto, PromptRuntimeRequestDto, RuntimeSnapshotDto } from "@pi/shared";
import type { Socket } from "socket.io";
import type { SocketRouter } from "./socket-router.js";
import { RuntimeService } from "../Service/runtime-service.js";
import type { SocketController } from "./socket-controller.js";

export class RuntimeController implements SocketController {
  constructor(private readonly runtimeService: RuntimeService) {}

  register(socket: Socket, router: SocketRouter): void {
    router.on<CreateRuntimeRequestDto, RuntimeSnapshotDto>(socket, "runtime:create", (input) => this.runtimeService.create(input));
    router.on<{ runtimeSlotId: string }, RuntimeSnapshotDto>(socket, "runtime:get", (input) => this.runtimeService.get(input.runtimeSlotId));
    router.on<PromptRuntimeRequestDto & { runtimeSlotId: string }, RuntimeSnapshotDto>(socket, "runtime:prompt", (input) =>
      this.runtimeService.prompt(input.runtimeSlotId, input),
    );
    router.on<{ runtimeSlotId: string }, RuntimeSnapshotDto>(socket, "runtime:abort", (input) => this.runtimeService.abort(input.runtimeSlotId));
    router.on<{ runtimeSlotId: string; sessionName: string }, RuntimeSnapshotDto>(socket, "runtime:rename", (input) =>
      this.runtimeService.rename(input.runtimeSlotId, input.sessionName),
    );
    router.on<{ runtimeSlotId: string }, null>(socket, "runtime:remove", async (input) => {
      await this.runtimeService.remove(input.runtimeSlotId);
      return null;
    });
    router.on<{ runtimeSlotId: string }, RuntimeSnapshotDto>(socket, "runtime:watch", async (input, socket) => {
      const snapshot = await this.runtimeService.get(input.runtimeSlotId);
      await socket.join(`runtime:${input.runtimeSlotId}`);
      return snapshot;
    });
    router.on<{ runtimeSlotId: string }, null>(socket, "runtime:unwatch", async (input, socket) => {
      await socket.leave(`runtime:${input.runtimeSlotId}`);
      return null;
    });
  }
}
