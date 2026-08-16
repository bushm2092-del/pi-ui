import type { A2uiToolDetails } from "@pi/shared";

export type MessageRole = "user" | "assistant" | "a2ui";
export type MessageStatus = "pending" | "complete" | "failed" | "stopped";

interface AssistantBlockBase {
  id: string;
}

export interface AssistantTextBlock extends AssistantBlockBase {
  type: "text";
  contentIndex: number;
  content: string;
}

export interface AssistantThinkingBlock extends AssistantBlockBase {
  type: "thinking";
  contentIndex: number;
  content: string;
}

export interface AssistantToolBlock extends AssistantBlockBase {
  type: "tool";
  contentIndex?: number;
  toolCallId?: string;
  name: string;
  status: "preparing" | "running" | "complete" | "failed";
  argumentText?: string;
  arguments?: unknown;
  output?: string;
  details?: unknown;
  isError?: boolean;
  a2ui?: A2uiToolDetails;
}

export interface AssistantStatusBlock extends AssistantBlockBase {
  type: "status";
  kind: "compaction" | "retry" | "summarization" | "extension";
  label: string;
  status: "running" | "complete" | "failed";
  details?: string;
}

export type AssistantContentBlock =
  | AssistantTextBlock
  | AssistantThinkingBlock
  | AssistantToolBlock
  | AssistantStatusBlock;

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  createdAt: string;
  completedAt?: string;
  blocks?: AssistantContentBlock[];
  a2ui?: A2uiToolDetails;
}

export function createMessage(
  role: MessageRole,
  content: string,
  status: MessageStatus = "complete",
): Message {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    status,
    createdAt: new Date().toISOString(),
  };
}
