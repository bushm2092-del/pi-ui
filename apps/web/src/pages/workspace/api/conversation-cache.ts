import { createMessage, type Conversation, type Message } from "../domain";

export interface PendingTurn {
  conversation: Conversation;
  assistantMessageId: string;
}

export function appendPendingTurn(
  conversation: Conversation,
  content: string,
): PendingTurn {
  const userMessage = createMessage("user", content);
  const assistantMessage = createMessage("assistant", "", "pending");

  return {
    conversation: {
      ...conversation,
      messages: [...conversation.messages, userMessage, assistantMessage],
    },
    assistantMessageId: assistantMessage.id,
  };
}

export function resolvePendingTurn(
  conversation: Conversation,
  assistantMessageId: string,
  content: string,
): Conversation {
  return updateAssistantMessage(conversation, assistantMessageId, content, "complete", true);
}

export function appendPendingAssistantText(
  conversation: Conversation,
  delta: string,
): Conversation {
  let index = -1;
  for (let candidate = conversation.messages.length - 1; candidate >= 0; candidate -= 1) {
    const message = conversation.messages[candidate];
    if (message?.role === "assistant" && message.status === "pending") {
      index = candidate;
      break;
    }
  }
  if (index < 0) return conversation;
  return {
    ...conversation,
    messages: conversation.messages.map((message, messageIndex) =>
      messageIndex === index
        ? upsertAssistantText(message, `${message.content}${delta}`)
        : message,
    ),
  };
}

export function failPendingTurn(
  conversation: Conversation,
  assistantMessageId: string,
): Conversation {
  return updateAssistantMessage(
    conversation,
    assistantMessageId,
    "消息发送失败，请重试。",
    "failed",
    true,
  );
}

export function stopPendingTurn(conversation: Conversation): Conversation {
  let targetId: string | undefined;
  for (let index = conversation.messages.length - 1; index >= 0; index -= 1) {
    const message = conversation.messages[index];
    if (message?.role === "assistant" && message.status === "pending") {
      targetId = message.id;
      break;
    }
  }
  if (!targetId) return conversation;
  return {
    ...conversation,
    messages: conversation.messages.map((message) => message.id === targetId
      ? { ...message, status: "stopped", completedAt: new Date().toISOString(), blocks: upsertStoppedStatus(message.blocks) }
      : message),
  };
}

function upsertStoppedStatus(blocks: Message["blocks"]): NonNullable<Message["blocks"]> {
  const status = {
    id: "status-generation",
    type: "status" as const,
    kind: "retry" as const,
    label: "回答已停止",
    status: "complete" as const,
  };
  const current = blocks ?? [];
  const index = current.findIndex((block) => block.id === status.id);
  return index < 0
    ? [...current, status]
    : current.map((block, blockIndex) => blockIndex === index ? status : block);
}

function updateAssistantMessage(
  conversation: Conversation,
  assistantMessageId: string,
  content: string,
  status: "complete" | "failed",
  preserveTerminalStatus = false,
): Conversation {
  return {
    ...conversation,
    messages: conversation.messages.map((message) =>
      message.id !== assistantMessageId
        ? message
        : preserveTerminalStatus && (message.status === "failed" || message.status === "stopped")
          ? message
          : {
              ...upsertAssistantText(message, content),
              status,
              completedAt: new Date().toISOString(),
            },
    ),
  };
}

function upsertAssistantText(message: Message, content: string): Message {
  const id = "text-response";
  const blocks = message.blocks ?? [];
  const existingIndex = blocks.findIndex((block) => block.id === id);
  const textBlock = { id, type: "text" as const, contentIndex: 0, content };

  if (blocks.length > 0 && existingIndex < 0) return { ...message, content };

  return {
    ...message,
    content,
    blocks: existingIndex < 0
      ? [...blocks, textBlock]
      : blocks.map((block, index) => index === existingIndex ? textBlock : block),
  };
}
