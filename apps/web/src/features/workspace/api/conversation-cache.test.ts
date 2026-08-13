import { describe, expect, it } from "vitest";
import type { Conversation } from "../domain";
import {
  appendPendingAssistantText,
  appendPendingTurn,
  failPendingTurn,
  resolvePendingTurn,
} from "./conversation-cache";

const conversation: Conversation = {
  id: "conversation-1",
  title: "Test conversation",
  processingLabel: "Done",
  summary: { sectionLabel: "Output", actionLabel: "Create" },
  messages: [],
};

describe("conversation cache updates", () => {
  it("appends a user message and pending assistant turn", () => {
    const pending = appendPendingTurn(conversation, "Hello");

    expect(pending.conversation.messages).toMatchObject([
      { role: "user", content: "Hello", status: "complete" },
      { role: "assistant", content: "", status: "pending" },
    ]);
    expect(pending.assistantMessageId).toBe(
      pending.conversation.messages[1]?.id,
    );
  });

  it("resolves only the matching pending assistant message", () => {
    const pending = appendPendingTurn(conversation, "Hello");
    const resolved = resolvePendingTurn(
      pending.conversation,
      pending.assistantMessageId,
      "World",
    );

    expect(resolved.messages.at(-1)).toMatchObject({
      content: "World",
      status: "complete",
    });
  });

  it("appends streaming text to the pending assistant message", () => {
    const pending = appendPendingTurn(conversation, "Hello");
    const first = appendPendingAssistantText(pending.conversation, "Hel");
    const second = appendPendingAssistantText(first, "lo");

    expect(second.messages.at(-1)).toMatchObject({
      content: "Hello",
      status: "pending",
    });
  });

  it("preserves the turn and marks it failed after an error", () => {
    const pending = appendPendingTurn(conversation, "Hello");
    const failed = failPendingTurn(
      pending.conversation,
      pending.assistantMessageId,
    );

    expect(failed.messages.at(-1)).toMatchObject({
      content: "消息发送失败，请重试。",
      status: "failed",
    });
  });
});
