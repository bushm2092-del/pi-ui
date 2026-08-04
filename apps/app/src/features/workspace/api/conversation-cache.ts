import { createMessage, type Conversation } from "../domain";

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
  return updateAssistantMessage(conversation, assistantMessageId, content, "complete");
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
  );
}

function updateAssistantMessage(
  conversation: Conversation,
  assistantMessageId: string,
  content: string,
  status: "complete" | "failed",
): Conversation {
  return {
    ...conversation,
    messages: conversation.messages.map((message) =>
      message.id === assistantMessageId
        ? { ...message, content, status }
        : message,
    ),
  };
}
