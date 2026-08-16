import { describe, expect, it } from "vitest";
import type { Conversation } from "../../domain";
import { appendPendingTurn } from "../../api/conversation-cache";
import { applyRuntimeEvent } from "./runtime-event-reducer";

const emptyConversation: Conversation = {
  id: "conversation-1",
  title: "Conversation",
  processingLabel: "已就绪",
  summary: { sectionLabel: "Output", actionLabel: "Create" },
  messages: [],
};

function agent(conversation: Conversation, payload: Record<string, unknown>) {
  return applyRuntimeEvent(conversation, { event: "agent.event", payload });
}

describe("runtime event reducer", () => {
  it("calibrates session activity from a runtime snapshot", () => {
    const conversation = applyRuntimeEvent(emptyConversation, {
      event: "runtime.snapshot",
      payload: {
        isStreaming: false,
        isIdle: false,
        isCompacting: true,
        retryAttempt: 2,
        thinkingLevel: "high",
      },
    });

    expect(conversation.runtime).toMatchObject({
      isStreaming: false,
      isIdle: false,
      isCompacting: true,
      retryAttempt: 2,
      thinkingLevel: "high",
    });
  });

  it("builds ordered thinking, text, and tool blocks from a streamed turn", () => {
    let conversation = appendPendingTurn(emptyConversation, "Build it").conversation;
    conversation = agent(conversation, { type: "agent_start" });
    conversation = agent(conversation, {
      type: "message_update",
      assistantMessageEvent: { type: "thinking_delta", contentIndex: 0, delta: "Check the repo" },
    });
    conversation = agent(conversation, {
      type: "message_update",
      assistantMessageEvent: { type: "text_delta", contentIndex: 1, delta: "I will inspect it." },
    });
    conversation = agent(conversation, {
      type: "message_update",
      assistantMessageEvent: { type: "toolcall_start", contentIndex: 2 },
    });
    conversation = agent(conversation, {
      type: "message_update",
      assistantMessageEvent: {
        type: "toolcall_end",
        contentIndex: 2,
        toolCall: { id: "call-1", name: "read", arguments: { path: "README.md" } },
      },
    });
    conversation = agent(conversation, {
      type: "tool_execution_start",
      toolCallId: "call-1",
      toolName: "read",
      args: { path: "README.md" },
    });
    conversation = agent(conversation, {
      type: "tool_execution_end",
      toolCallId: "call-1",
      toolName: "read",
      result: { content: [{ type: "text", text: "contents" }] },
      isError: false,
    });
    conversation = agent(conversation, { type: "agent_settled" });

    expect(conversation.runtime).toMatchObject({ isIdle: true, isStreaming: false });
    expect(conversation.messages.at(-1)).toMatchObject({
      role: "assistant",
      content: "I will inspect it.",
      status: "complete",
      blocks: [
        { type: "thinking", content: "Check the repo" },
        { type: "text", content: "I will inspect it." },
        { type: "tool", toolCallId: "call-1", name: "read", status: "complete", output: "contents" },
      ],
    });
  });

  it("updates system status blocks in place", () => {
    let conversation = appendPendingTurn(emptyConversation, "Continue").conversation;
    conversation = agent(conversation, { type: "compaction_start", reason: "threshold" });
    conversation = agent(conversation, { type: "compaction_end", reason: "threshold", aborted: false });
    conversation = agent(conversation, {
      type: "auto_retry_start",
      attempt: 2,
      maxAttempts: 3,
      errorMessage: "rate limited",
    });
    conversation = agent(conversation, { type: "auto_retry_end", success: true, attempt: 2 });

    expect(conversation.messages.at(-1)?.blocks).toMatchObject([
      { id: "status-compaction", label: "上下文压缩完成", status: "complete" },
      { id: "status-retry", label: "重试成功", status: "complete" },
    ]);
  });

  it("consumes queue, session, thinking, entry, and abort events", () => {
    let conversation = appendPendingTurn(emptyConversation, "Stop later").conversation;
    conversation = agent(conversation, { type: "agent_start" });
    conversation = agent(conversation, { type: "queue_update", steering: ["one"], followUp: ["two"] });
    conversation = agent(conversation, { type: "session_info_changed", name: "Renamed" });
    conversation = agent(conversation, { type: "thinking_level_changed", level: "high" });
    conversation = agent(conversation, { type: "entry_appended", entry: { type: "message", id: "entry-1" } });
    conversation = agent(conversation, {
      type: "message_update",
      assistantMessageEvent: { type: "error", reason: "aborted", error: { errorMessage: "aborted" } },
    });
    conversation = agent(conversation, { type: "message_start", message: { role: "assistant", content: [] } });
    conversation = agent(conversation, {
      type: "tool_execution_end",
      toolCallId: "call-after-stop",
      toolName: "bash",
      result: { content: [{ type: "text", text: "aborted" }] },
      isError: true,
    });
    conversation = agent(conversation, { type: "agent_settled" });

    expect(conversation).toMatchObject({
      title: "Renamed",
      runtime: {
        isIdle: true,
        isStreaming: false,
        steeringQueue: ["one"],
        followUpQueue: ["two"],
        thinkingLevel: "high",
        latestEntry: { id: "entry-1" },
      },
    });
    expect(conversation.messages.at(-1)).toMatchObject({ status: "stopped" });
    expect(conversation.messages.filter((message) => message.role === "assistant")).toHaveLength(1);
  });

  it("keeps content indexes from separate model messages in event order", () => {
    let conversation = appendPendingTurn(emptyConversation, "Use two turns").conversation;
    conversation = agent(conversation, { type: "agent_start" });
    conversation = agent(conversation, { type: "message_start", message: { role: "assistant", content: [] } });
    conversation = agent(conversation, {
      type: "message_update",
      assistantMessageEvent: { type: "text_delta", contentIndex: 0, delta: "First" },
    });
    conversation = agent(conversation, { type: "message_start", message: { role: "assistant", content: [] } });
    conversation = agent(conversation, {
      type: "message_update",
      assistantMessageEvent: { type: "text_delta", contentIndex: 0, delta: "Second" },
    });

    expect(conversation.messages.at(-1)?.blocks).toMatchObject([
      { id: "text-1-0", content: "First" },
      { id: "text-2-0", content: "Second" },
    ]);
  });

  it("records extension errors as folded status content", () => {
    const running = agent(appendPendingTurn(emptyConversation, "Run").conversation, { type: "agent_start" });
    const conversation = applyRuntimeEvent(running, {
      event: "extension.error",
      payload: { extensionPath: "/tmp/ext.ts", event: "tool_call", message: "Failed", stack: "trace" },
    });

    expect(conversation.messages.at(-1)?.blocks).toMatchObject([
      { type: "status", kind: "extension", status: "failed", label: "扩展错误：Failed" },
    ]);
  });
});
