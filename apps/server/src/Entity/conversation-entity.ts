export type ConversationStatus = "idle" | "running" | "failed";

/**
 * Sidebar metadata for a Pi conversation. Message bodies are intentionally absent
 * because the Pi session JSONL remains their source of truth.
 */
export interface ConversationEntity {
  id: string;
  projectId: string;
  piSessionId: string;
  sessionFile: string | null;
  title: string;
  status: ConversationStatus;
  isPinned: boolean;
  pinnedAt: number | null;
  archivedAt: number | null;
  unreadCount: number;
  lastMessageAt: number | null;
  lastOpenedAt: number | null;
  createdAt: number;
  updatedAt: number;
}
