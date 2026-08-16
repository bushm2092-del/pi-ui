import { SocketClient } from "./socket-client";
import type { CreateProjectDto, ProjectActionDto, SidebarProjectDto, UpdateProjectDto, UpsertProjectDto } from "@pi/shared";

export class ProjectApi {
  constructor(private readonly client: SocketClient) {}

  create(input: CreateProjectDto): Promise<SidebarProjectDto> {
    return this.client.request("project:create", input);
  }

  get(projectId: string): Promise<SidebarProjectDto> {
    return this.client.request("project:get", { projectId });
  }

  list(): Promise<SidebarProjectDto[]> {
    return this.client.request("project:list", null);
  }

  update(input: UpdateProjectDto): Promise<SidebarProjectDto> {
    return this.client.request("project:update", input);
  }

  async remove(projectId: string): Promise<void> {
    await this.client.request<null>("project:delete", { projectId } satisfies ProjectActionDto);
  }

  upsert(input: UpsertProjectDto): Promise<SidebarProjectDto> {
    return this.client.request("project:upsert", input);
  }
}
