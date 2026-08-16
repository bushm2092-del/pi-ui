import type { CreateProjectDto, ProjectActionDto, SidebarProjectDto, UpdateProjectDto, UpsertProjectDto } from "@pi/shared";
import type { Socket } from "socket.io";
import type { SocketRouter } from "./socket-router.js";
import { ProjectService } from "../Service/project-service.js";
import type { SocketController } from "./socket-controller.js";

export class ProjectController implements SocketController {
  constructor(private readonly service: ProjectService) {}

  register(socket: Socket, router: SocketRouter): void {
    router.on<CreateProjectDto, SidebarProjectDto>(socket, "project:create", (input) => this.service.create(input));
    router.on<ProjectActionDto, SidebarProjectDto>(socket, "project:get", (input) => this.service.get(input.projectId));
    router.on<null, SidebarProjectDto[]>(socket, "project:list", () => this.service.list());
    router.on<UpdateProjectDto, SidebarProjectDto>(socket, "project:update", (input) => this.service.update(input));
    router.on<ProjectActionDto, null>(socket, "project:delete", (input) => {
      this.service.remove(input.projectId);
      return null;
    });
    router.on<UpsertProjectDto, SidebarProjectDto>(socket, "project:upsert", (input) => this.service.upsert(input));
  }
}
