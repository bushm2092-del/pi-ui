import type { CreateProjectDto, ProjectActionDto, SidebarProjectDto, UpdateProjectDto, UpsertProjectDto } from "@pi/shared";
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
    socket.on("project:create", (input: CreateProjectDto, ack: SocketAck<SidebarProjectDto>) =>
      this.interceptor.execute(ack, () => this.service.create(input)),
    );
    socket.on("project:get", (input: ProjectActionDto, ack: SocketAck<SidebarProjectDto>) =>
      this.interceptor.execute(ack, () => this.service.get(input.projectId)),
    );
    socket.on("project:list", (_input: null, ack: SocketAck<SidebarProjectDto[]>) =>
      this.interceptor.execute(ack, () => this.service.list()),
    );
    socket.on("project:update", (input: UpdateProjectDto, ack: SocketAck<SidebarProjectDto>) =>
      this.interceptor.execute(ack, () => this.service.update(input)),
    );
    socket.on("project:delete", (input: ProjectActionDto, ack: SocketAck<null>) =>
      this.interceptor.execute(ack, () => {
        this.service.remove(input.projectId);
        return null;
      }),
    );
    socket.on("project:upsert", (input: UpsertProjectDto, ack: SocketAck<SidebarProjectDto>) =>
      this.interceptor.execute(ack, () => this.service.upsert(input)),
    );
  }
}
