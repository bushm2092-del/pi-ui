export type SidebarConversationIndicator = "running" | "unread";

export interface SidebarConversationDto {
  id: string;
  projectId: string;
  title: string;
  indicator?: SidebarConversationIndicator;
  isPinned: boolean;
  updatedAt: number;
}

export interface SidebarProjectDto {
  id: string;
  name: string;
  cwd: string;
  conversations: SidebarConversationDto[];
  hasMore: boolean;
  hasUnread: boolean;
}

export interface SidebarDto {
  projects: SidebarProjectDto[];
  pinned: SidebarConversationDto[];
  recent: SidebarConversationDto[];
}

export interface UpsertProjectDto { id?: string; name: string; cwd: string; }
export interface ConversationActionDto { conversationId: string; }
export interface PinConversationDto extends ConversationActionDto { pinned: boolean; }
export interface ProjectConversationsDto { projectId: string; offset?: number; limit?: number; }
export interface SyncConversationDto {
  id: string;
  projectId: string;
  piSessionId: string;
  sessionFile?: string;
  title: string;
  status: "idle" | "running" | "failed";
}
