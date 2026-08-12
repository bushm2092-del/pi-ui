import type { A2uiToolDetails } from "@pi/protocol";

export type MessageRole = "user" | "assistant" | "a2ui";
export type MessageStatus = "pending" | "complete" | "failed";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  createdAt: string;
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
