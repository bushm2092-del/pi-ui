import { basename } from "node:path";
import type { SidebarProjectDto, UpsertProjectDto } from "@pi/shared";
import { ConversationMapper } from "../Mapper/conversation-mapper.js";
import { ProjectMapper } from "../Mapper/project-mapper.js";
import { toConversationDto } from "./conversation-service.js";

const DEFAULT_CONVERSATION_LIMIT = 5;

export class ProjectService {
  constructor(
    private readonly projectMapper: ProjectMapper,
    private readonly conversationMapper: ConversationMapper,
  ) {}

  list(): SidebarProjectDto[] {
    return this.projectMapper.findAll().map((project) => this.#toDto(project));
  }

  upsert(input: UpsertProjectDto): SidebarProjectDto {
    return this.#toDto(this.projectMapper.upsert({ ...input, name: input.name.trim() || basename(input.cwd) }));
  }

  #toDto(project: ReturnType<ProjectMapper["upsert"]>): SidebarProjectDto {
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
}
