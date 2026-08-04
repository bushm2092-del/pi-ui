export type MessageRole = "user" | "assistant";
export type MessageStatus = "pending" | "complete" | "failed";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  createdAt: string;
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
