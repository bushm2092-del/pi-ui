import { basename } from "node:path";
import type { DatabaseSync } from "node:sqlite";
import type { CreateProjectDto, SidebarProjectDto, UpdateProjectDto, UpsertProjectDto } from "@pi/shared";
import type { ProjectEntity } from "../Entity/project-entity.js";
import { BusinessException } from "../Exception/business-exception.js";
import { ConversationMapper } from "../Mapper/conversation-mapper.js";
import { ProjectMapper } from "../Mapper/project-mapper.js";
import { toConversationDto } from "./conversation-service.js";

const DEFAULT_CONVERSATION_LIMIT = 5;

export class ProjectService {
  constructor(
    private readonly projectMapper: ProjectMapper,
    private readonly conversationMapper: ConversationMapper,
    private readonly database: DatabaseSync,
  ) {}

  create(input: CreateProjectDto): SidebarProjectDto {
    return this.#toDto(this.projectMapper.create({ ...input, name: this.#name(input.name, input.cwd) }));
  }

  get(projectId: string): SidebarProjectDto {
    return this.#toDto(this.#require(projectId));
  }

  list(): SidebarProjectDto[] {
    return this.projectMapper.findAll().map((project) => this.#toDto(project));
  }

  upsert(input: UpsertProjectDto): SidebarProjectDto {
    return this.#toDto(this.projectMapper.upsert({ ...input, name: this.#name(input.name, input.cwd) }));
  }

  update(input: UpdateProjectDto): SidebarProjectDto {
    if (input.name === undefined && input.cwd === undefined) {
      throw new BusinessException("project_invalid_input", "Project update requires a name or cwd");
    }
    const project = this.#require(input.projectId);
    const cwd = input.cwd ?? project.cwd;
    const name = input.name === undefined ? project.name : this.#name(input.name, cwd);
    return this.#toDto(this.projectMapper.update(input.projectId, { name, cwd })!);
  }

  remove(projectId: string): void {
    this.database.exec("BEGIN IMMEDIATE");
    try {
      this.conversationMapper.deleteByProject(projectId);
      if (!this.projectMapper.delete(projectId)) this.#notFound(projectId);
      this.database.exec("COMMIT");
    } catch (error) {
      this.database.exec("ROLLBACK");
      throw error;
    }
  }

  #toDto(project: ProjectEntity): SidebarProjectDto {
    const conversations = this.conversationMapper.findByProject(project.id, DEFAULT_CONVERSATION_LIMIT);
    return {
      id: project.id,
      name: project.name,
      cwd: project.cwd,
      conversations: conversations.map(toConversationDto),
      hasMore: this.conversationMapper.countByProject(project.id) > conversations.length,
      hasUnread: conversations.some((conversation) => conversation.unreadCount > 0 || conversation.status === "running"),
    };
  }

  #require(projectId: string): ProjectEntity {
    const project = this.projectMapper.findById(projectId);
    if (!project) this.#notFound(projectId);
    return project;
  }

  #notFound(projectId: string): never {
    throw new BusinessException("project_not_found", `Unknown project: ${projectId}`);
  }

  #name(name: string, cwd: string): string {
    return name.trim() || basename(cwd);
  }
}
