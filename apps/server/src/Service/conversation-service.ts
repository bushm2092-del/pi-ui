import type { ProjectConversationsDto, SidebarConversationDto, SyncConversationDto } from "@pi/shared";
import type { ConversationEntity } from "../Entity/conversation-entity.js";
import { BusinessException } from "../Exception/business-exception.js";
import { ConversationMapper } from "../Mapper/conversation-mapper.js";

export class ConversationService {
  constructor(private readonly conversationMapper: ConversationMapper) {}
  listRecent(): SidebarConversationDto[] {
    return this.conversationMapper.findRecent().map(toConversationDto);
  }
  listPinned(): SidebarConversationDto[] {
    return this.conversationMapper.findPinned().map(toConversationDto);
  }
  listByProject(input: ProjectConversationsDto): SidebarConversationDto[] {
    const limit = Math.min(Math.max(input.limit ?? 20, 1), 100);
    return this.conversationMapper.findByProject(input.projectId, limit, Math.max(input.offset ?? 0, 0)).map(toConversationDto);
  }
  sync(input: SyncConversationDto): SidebarConversationDto {
    return toConversationDto(this.conversationMapper.upsert(input));
  }
  setPinned(id: string, pinned: boolean): void {
    if (!this.conversationMapper.setPinned(id, pinned)) this.#notFound(id);
  }
  archive(id: string): void {
    if (!this.conversationMapper.archive(id)) this.#notFound(id);
  }
  markRead(id: string): void {
    if (!this.conversationMapper.markRead(id)) this.#notFound(id);
  }
  #notFound(id: string): never {
    throw new BusinessException("conversation_not_found", `Unknown conversation: ${id}`);
  }
}

export function toConversationDto(conversation: ConversationEntity): SidebarConversationDto {
  return {
    id: conversation.id,
    projectId: conversation.projectId,
    title: conversation.title,
    isPinned: conversation.isPinned,
    indicator: conversation.status === "running" ? "running" : conversation.unreadCount > 0 ? "unread" : undefined,
    updatedAt: conversation.lastMessageAt ?? conversation.updatedAt,
  };
}
