import type { SidebarProjectDto, UpsertProjectDto } from "@pi/shared";
import type { Socket } from "socket.io";
import { ExceptionInterceptor, type SocketAck } from "../Interceptor/exception-interceptor.js";
import { ProjectService } from "../Service/project-service.js";
import type { SocketController } from "./socket-controller.js";

export class ProjectController implements SocketController {
  constructor(
    private readonly service: ProjectService,
    private readonly interceptor: ExceptionInterceptor,
  ) {}
  register(socket: Socket): void {
    socket.on("project:list", (_input: null, ack: SocketAck<SidebarProjectDto[]>) =>
      this.interceptor.execute(ack, () => this.service.list()),
    );
    socket.on("project:upsert", (input: UpsertProjectDto, ack: SocketAck<SidebarProjectDto>) =>
      this.interceptor.execute(ack, () => this.service.upsert(input)),
    );
  }
}
