import type { CreateRuntimeRequestDto, PromptRuntimeRequestDto, RuntimeSnapshotDto } from "@pi/shared";
import type { Socket } from "socket.io";
import { BusinessException } from "../Exception/business-exception.js";
import { ExceptionInterceptor, type SocketAck } from "../Interceptor/exception-interceptor.js";
import { RuntimeNotFoundError, RuntimeService } from "../Service/runtime-service.js";
import type { SocketController } from "./socket-controller.js";

export class RuntimeController implements SocketController {
  constructor(
    private readonly runtimeService: RuntimeService,
    private readonly exceptionInterceptor: ExceptionInterceptor,
  ) {}

  register(socket: Socket): void {
    socket.on("runtime:create", (input: CreateRuntimeRequestDto, ack: SocketAck<RuntimeSnapshotDto>) => {
      this.#execute(ack, () => this.runtimeService.create(input));
    });
    socket.on("runtime:get", (input: { runtimeSlotId: string }, ack: SocketAck<RuntimeSnapshotDto>) => {
      this.#execute(ack, () => this.runtimeService.get(input.runtimeSlotId));
    });
    socket.on("runtime:prompt", (input: PromptRuntimeRequestDto & { runtimeSlotId: string }, ack: SocketAck<RuntimeSnapshotDto>) => {
      this.#execute(ack, () => this.runtimeService.prompt(input.runtimeSlotId, input));
    });
    socket.on("runtime:abort", (input: { runtimeSlotId: string }, ack: SocketAck<RuntimeSnapshotDto>) => {
      this.#execute(ack, () => this.runtimeService.abort(input.runtimeSlotId));
    });
    socket.on("runtime:rename", (input: { runtimeSlotId: string; sessionName: string }, ack: SocketAck<RuntimeSnapshotDto>) => {
      this.#execute(ack, () => this.runtimeService.rename(input.runtimeSlotId, input.sessionName));
    });
    socket.on("runtime:remove", (input: { runtimeSlotId: string }, ack: SocketAck<null>) => {
      this.#execute(ack, async () => {
        await this.runtimeService.remove(input.runtimeSlotId);
        return null;
      });
    });
    socket.on("runtime:watch", (input: { runtimeSlotId: string }, ack: SocketAck<RuntimeSnapshotDto>) => {
      this.#execute(ack, async () => {
        const snapshot = await this.runtimeService.get(input.runtimeSlotId);
        await socket.join(`runtime:${input.runtimeSlotId}`);
        return snapshot;
      });
    });
    socket.on("runtime:unwatch", (input: { runtimeSlotId: string }, ack: SocketAck<null>) => {
      this.#execute(ack, async () => {
        await socket.leave(`runtime:${input.runtimeSlotId}`);
        return null;
      });
    });
  }

  #execute<T>(ack: SocketAck<T>, operation: () => T | Promise<T>): void {
    this.exceptionInterceptor.execute(ack, async () => {
      try {
        return await operation();
      } catch (error) {
        if (error instanceof RuntimeNotFoundError) throw new BusinessException("runtime_not_found", error.message);
        throw error;
      }
    });
  }
}
