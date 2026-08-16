import { isA2uiToolDetails } from "@pi/shared";
import {
  createMessage,
  type AssistantContentBlock,
  type AssistantStatusBlock,
  type AssistantToolBlock,
  type Conversation,
  type Message,
} from "../../domain";

export interface WorkspaceRuntimeEvent {
  event: string;
  payload: unknown;
}

export function applyRuntimeEvent(conversation: Conversation, runtimeEvent: WorkspaceRuntimeEvent): Conversation {
  const { event, payload } = runtimeEvent;
  let next = withRuntime(conversation, { lastEvent: event });

  if (event === "runtime.snapshot" && isRecord(payload)) {
    return withRuntime(next, {
      isStreaming: payload.isStreaming === true,
      isIdle: payload.isIdle === true,
      isCompacting: payload.isCompacting === true,
      retryAttempt: readNumber(payload.retryAttempt) ?? 0,
      thinkingLevel: typeof payload.thinkingLevel === "string" ? payload.thinkingLevel : undefined,
    });
  }

  if (event === "extension.error") {
    if (conversation.runtime?.isStreaming !== true) return next;
    return updateAssistant(next, (message) =>
      upsertStatus(message, {
        id: `status-extension-${readString(payload, "extensionPath") ?? "unknown"}-${readString(payload, "event") ?? "event"}`,
        type: "status",
        kind: "extension",
        label: `扩展错误：${readString(payload, "message") ?? "未知错误"}`,
        status: "failed",
        details: formatExtensionError(payload),
      }),
    );
  }

  if (event !== "agent.event" || !isRecord(payload) || typeof payload.type !== "string") return next;
  return applyAgentEvent(withRuntime(next, { lastEvent: `agent.event:${payload.type}` }), payload);
}

function applyAgentEvent(conversation: Conversation, event: Record<string, unknown>): Conversation {
  switch (event.type) {
    case "agent_start":
      return withRuntime(ensureAssistant(conversation), { isStreaming: true, isIdle: false, messageSequence: 0 }, "正在生成");
    case "agent_end":
    case "turn_start":
    case "turn_end":
      return conversation;
    case "agent_settled":
      return withRuntime(
        completePendingAssistant(conversation),
        {
          isStreaming: false,
          isIdle: true,
          isCompacting: false,
          retryAttempt: 0,
        },
        "已就绪",
      );
    case "message_start":
      return isAssistantMessage(event.message)
        ? withRuntime(ensureAssistant(conversation), { messageSequence: (conversation.runtime?.messageSequence ?? 0) + 1 })
        : conversation;
    case "message_update":
      return applyMessageUpdate(conversation, event.assistantMessageEvent);
    case "message_end":
      return applyMessageEnd(conversation, event.message);
    case "tool_execution_start":
      return updateToolExecution(conversation, event, "running");
    case "tool_execution_update":
      return updateToolExecution(conversation, event, "running");
    case "tool_execution_end":
      return updateToolExecution(conversation, event, event.isError === true ? "failed" : "complete");
    case "queue_update":
      return withRuntime(conversation, {
        steeringQueue: readStringArray(event.steering),
        followUpQueue: readStringArray(event.followUp),
      });
    case "compaction_start":
      return withRuntime(
        updateAssistant(conversation, (message) =>
          upsertStatus(message, {
            id: "status-compaction",
            type: "status",
            kind: "compaction",
            label: "正在压缩上下文…",
            status: "running",
          }),
        ),
        { isCompacting: true, isIdle: false },
      );
    case "compaction_end": {
      const failed = typeof event.errorMessage === "string";
      return withRuntime(
        updateAssistant(conversation, (message) =>
          upsertStatus(message, {
            id: "status-compaction",
            type: "status",
            kind: "compaction",
            label: failed ? "上下文压缩失败" : event.aborted === true ? "上下文压缩已停止" : "上下文压缩完成",
            status: failed ? "failed" : "complete",
            details: typeof event.errorMessage === "string" ? event.errorMessage : undefined,
          }),
        ),
        { isCompacting: false },
      );
    }
    case "auto_retry_start":
      return withRuntime(
        updateAssistant(conversation, (message) =>
          upsertStatus(message, {
            id: "status-retry",
            type: "status",
            kind: "retry",
            label: `正在重试 · 第 ${readNumber(event.attempt) ?? 1}/${readNumber(event.maxAttempts) ?? "?"} 次`,
            status: "running",
            details: typeof event.errorMessage === "string" ? event.errorMessage : undefined,
          }),
        ),
        { retryAttempt: readNumber(event.attempt) ?? 1, isIdle: false },
      );
    case "auto_retry_end":
      return withRuntime(
        updateAssistant(conversation, (message) =>
          upsertStatus(message, {
            id: "status-retry",
            type: "status",
            kind: "retry",
            label: event.success === true ? "重试成功" : "重试失败",
            status: event.success === true ? "complete" : "failed",
            details: typeof event.finalError === "string" ? event.finalError : undefined,
          }),
        ),
        { retryAttempt: 0 },
      );
    case "summarization_retry_scheduled":
      return updateAssistant(conversation, (message) =>
        upsertStatus(message, {
          id: "status-summarization",
          type: "status",
          kind: "summarization",
          label: `摘要生成等待重试 · 第 ${readNumber(event.attempt) ?? 1}/${readNumber(event.maxAttempts) ?? "?"} 次`,
          status: "running",
          details: typeof event.errorMessage === "string" ? event.errorMessage : undefined,
        }),
      );
    case "summarization_retry_attempt_start":
      return updateAssistant(conversation, (message) =>
        upsertStatus(message, {
          id: "status-summarization",
          type: "status",
          kind: "summarization",
          label: "正在重新生成摘要…",
          status: "running",
        }),
      );
    case "summarization_retry_finished":
      return updateAssistant(conversation, (message) =>
        upsertStatus(message, {
          id: "status-summarization",
          type: "status",
          kind: "summarization",
          label: "摘要生成完成",
          status: "complete",
        }),
      );
    case "bash_execution_update":
      return updateAssistant(conversation, (message) =>
        upsertTool(
          message,
          {
            id: `bash-${typeof event.id === "string" ? event.id : "current"}`,
            type: "tool",
            toolCallId: typeof event.id === "string" ? event.id : undefined,
            name: "终端命令",
            status: "running",
            output: typeof event.delta === "string" ? event.delta : "",
          },
          true,
        ),
      );
    case "entry_appended":
      return withRuntime(conversation, { latestEntry: event.entry });
    case "session_info_changed":
      return typeof event.name === "string" ? { ...conversation, title: event.name } : conversation;
    case "thinking_level_changed":
      return withRuntime(conversation, {
        thinkingLevel: typeof event.level === "string" ? event.level : undefined,
      });
    default:
      return conversation;
  }
}

function applyMessageUpdate(conversation: Conversation, value: unknown): Conversation {
  if (!isRecord(value) || typeof value.type !== "string") return conversation;
  const index = readNumber(value.contentIndex) ?? 0;
  const sequence = conversation.runtime?.messageSequence ?? 0;
  const blockId = `${value.type.startsWith("thinking") ? "thinking" : value.type.startsWith("toolcall") ? "tool" : "text"}-${sequence}-${index}`;

  if (value.type === "start" || value.type === "done") return ensureAssistant(conversation);
  if (value.type === "error") {
    const stopped = value.reason === "aborted";
    return updateAssistant(conversation, (message) => ({
      ...message,
      status: stopped ? "stopped" : "failed",
      completedAt: new Date().toISOString(),
      blocks: upsertBlock(message.blocks, {
        id: "status-generation",
        type: "status",
        kind: "retry",
        label: stopped ? "回答已停止" : "回答失败",
        status: stopped ? "complete" : "failed",
        details: readString(value.error, "errorMessage"),
      }),
    }));
  }
  if (value.type === "text_start" || value.type === "text_delta" || value.type === "text_end") {
    return updateAssistant(conversation, (message) => {
      const existing = message.blocks?.find((block) => block.id === blockId && block.type === "text");
      const content =
        value.type === "text_delta"
          ? `${existing?.type === "text" ? existing.content : ""}${typeof value.delta === "string" ? value.delta : ""}`
          : value.type === "text_end" && typeof value.content === "string"
            ? value.content
            : existing?.type === "text"
              ? existing.content
              : "";
      const blocks = upsertBlock(message.blocks, { id: blockId, type: "text", contentIndex: index, content });
      return { ...message, content: textFromBlocks(blocks), blocks };
    });
  }
  if (value.type === "thinking_start" || value.type === "thinking_delta" || value.type === "thinking_end") {
    return updateAssistant(conversation, (message) => {
      const existing = message.blocks?.find((block) => block.id === blockId && block.type === "thinking");
      const content =
        value.type === "thinking_delta"
          ? `${existing?.type === "thinking" ? existing.content : ""}${typeof value.delta === "string" ? value.delta : ""}`
          : value.type === "thinking_end" && typeof value.content === "string"
            ? value.content
            : existing?.type === "thinking"
              ? existing.content
              : "";
      return { ...message, blocks: upsertBlock(message.blocks, { id: blockId, type: "thinking", contentIndex: index, content }) };
    });
  }
  if (value.type === "toolcall_start" || value.type === "toolcall_delta" || value.type === "toolcall_end") {
    return updateAssistant(conversation, (message) => {
      const existing = message.blocks?.find((block) => block.id === blockId && block.type === "tool");
      const toolCall = isRecord(value.toolCall) ? value.toolCall : undefined;
      return upsertTool(message, {
        id: blockId,
        type: "tool",
        contentIndex: index,
        toolCallId: readString(toolCall, "id") ?? (existing?.type === "tool" ? existing.toolCallId : undefined),
        name: readString(toolCall, "name") ?? (existing?.type === "tool" ? existing.name : "准备工具调用"),
        status: existing?.type === "tool" && existing.status !== "preparing" ? existing.status : "preparing",
        argumentText:
          value.type === "toolcall_delta"
            ? `${existing?.type === "tool" ? (existing.argumentText ?? "") : ""}${typeof value.delta === "string" ? value.delta : ""}`
            : existing?.type === "tool"
              ? existing.argumentText
              : undefined,
        arguments: toolCall?.arguments ?? (existing?.type === "tool" ? existing.arguments : undefined),
      });
    });
  }
  return conversation;
}

function applyMessageEnd(conversation: Conversation, value: unknown): Conversation {
  if (!isRecord(value) || value.role !== "toolResult" || typeof value.toolCallId !== "string") return conversation;
  return updateAssistant(conversation, (message) => {
    const details = value.details;
    return updateToolByCallId(message, value.toolCallId as string, (tool) => ({
      ...tool,
      status: value.isError === true ? "failed" : "complete",
      isError: value.isError === true,
      output: readContentText(value.content) || tool.output,
      details,
      a2ui: isA2uiToolDetails(details) ? details : tool.a2ui,
    }));
  });
}

function updateToolExecution(
  conversation: Conversation,
  event: Record<string, unknown>,
  status: AssistantToolBlock["status"],
): Conversation {
  if (typeof event.toolCallId !== "string") return conversation;
  return updateAssistant(conversation, (message) => {
    const toolCallId = event.toolCallId as string;
    const existing = message.blocks?.find((block) => block.type === "tool" && block.toolCallId === toolCallId);
    const result = event.result;
    const details = isRecord(result) ? result.details : undefined;
    const next: AssistantToolBlock = {
      id: existing?.id ?? `tool-execution-${toolCallId}`,
      type: "tool",
      contentIndex: existing?.type === "tool" ? existing.contentIndex : undefined,
      toolCallId,
      name: typeof event.toolName === "string" ? event.toolName : existing?.type === "tool" ? existing.name : "工具调用",
      status,
      arguments: event.args ?? (existing?.type === "tool" ? existing.arguments : undefined),
      argumentText: existing?.type === "tool" ? existing.argumentText : undefined,
      output:
        event.type === "tool_execution_update"
          ? formatUnknown(event.partialResult)
          : readResultText(result) || (existing?.type === "tool" ? existing.output : undefined),
      details: details ?? (existing?.type === "tool" ? existing.details : undefined),
      isError: event.isError === true,
      a2ui: isA2uiToolDetails(details) ? details : existing?.type === "tool" ? existing.a2ui : undefined,
    };
    return upsertTool(message, next);
  });
}

function ensureAssistant(conversation: Conversation): Conversation {
  if (findPendingAssistant(conversation)) return conversation;
  const hasAssistant = conversation.messages.some((message) => message.role === "assistant");
  if (hasAssistant && conversation.runtime?.isStreaming === true) return conversation;
  return {
    ...conversation,
    messages: [...conversation.messages, createMessage("assistant", "", "pending")],
  };
}

function updateAssistant(conversation: Conversation, update: (message: Message) => Message): Conversation {
  const existing =
    findPendingAssistant(conversation) ?? [...conversation.messages].reverse().find((message) => message.role === "assistant");
  const prepared = existing ? conversation : ensureAssistant(conversation);
  const target = existing ?? findPendingAssistant(prepared);
  if (!target) return prepared;
  return {
    ...prepared,
    messages: prepared.messages.map((message) => (message.id === target.id ? update(message) : message)),
  };
}

function findPendingAssistant(conversation: Conversation): Message | undefined {
  return [...conversation.messages].reverse().find((message) => message.role === "assistant" && message.status === "pending");
}

function completePendingAssistant(conversation: Conversation): Conversation {
  const pending = findPendingAssistant(conversation);
  if (!pending) return conversation;
  return {
    ...conversation,
    messages: conversation.messages.map((message) =>
      message.id === pending.id ? { ...message, status: "complete", completedAt: new Date().toISOString() } : message,
    ),
  };
}

function upsertTool(message: Message, tool: AssistantToolBlock, appendOutput = false): Message {
  const blocks = message.blocks ?? [];
  const existingIndex = blocks.findIndex(
    (block) => block.id === tool.id || (tool.toolCallId && block.type === "tool" && block.toolCallId === tool.toolCallId),
  );
  if (existingIndex < 0) return { ...message, blocks: [...blocks, tool] };
  const existing = blocks[existingIndex];
  const nextTool =
    existing.type === "tool"
      ? { ...existing, ...tool, output: appendOutput ? `${existing.output ?? ""}${tool.output ?? ""}` : (tool.output ?? existing.output) }
      : tool;
  return { ...message, blocks: blocks.map((block, index) => (index === existingIndex ? nextTool : block)) };
}

function updateToolByCallId(message: Message, toolCallId: string, update: (tool: AssistantToolBlock) => AssistantToolBlock): Message {
  const blocks = message.blocks ?? [];
  const index = blocks.findIndex((block) => block.type === "tool" && block.toolCallId === toolCallId);
  if (index < 0)
    return upsertTool(
      message,
      update({
        id: `tool-execution-${toolCallId}`,
        type: "tool",
        toolCallId,
        name: "工具调用",
        status: "running",
      }),
    );
  const block = blocks[index];
  if (block.type !== "tool") return message;
  return { ...message, blocks: blocks.map((candidate, candidateIndex) => (candidateIndex === index ? update(block) : candidate)) };
}

function upsertStatus(message: Message, status: AssistantStatusBlock): Message {
  return { ...message, blocks: upsertBlock(message.blocks, status) };
}

function upsertBlock(blocks: AssistantContentBlock[] | undefined, block: AssistantContentBlock): AssistantContentBlock[] {
  const current = blocks ?? [];
  const index = current.findIndex((candidate) => candidate.id === block.id);
  return index < 0 ? [...current, block] : current.map((candidate, candidateIndex) => (candidateIndex === index ? block : candidate));
}

function textFromBlocks(blocks: AssistantContentBlock[]): string {
  return blocks
    .filter((block): block is Extract<AssistantContentBlock, { type: "text" }> => block.type === "text")
    .map((block) => block.content)
    .join("\n");
}

function withRuntime(
  conversation: Conversation,
  update: Partial<NonNullable<Conversation["runtime"]>>,
  processingLabel?: string,
): Conversation {
  return {
    ...conversation,
    processingLabel: processingLabel ?? conversation.processingLabel,
    runtime: {
      isStreaming: conversation.runtime?.isStreaming ?? false,
      isIdle: conversation.runtime?.isIdle ?? true,
      isCompacting: conversation.runtime?.isCompacting ?? false,
      retryAttempt: conversation.runtime?.retryAttempt ?? 0,
      steeringQueue: conversation.runtime?.steeringQueue ?? [],
      followUpQueue: conversation.runtime?.followUpQueue ?? [],
      messageSequence: conversation.runtime?.messageSequence ?? 0,
      thinkingLevel: conversation.runtime?.thinkingLevel,
      latestEntry: conversation.runtime?.latestEntry,
      lastEvent: conversation.runtime?.lastEvent,
      ...update,
    },
  };
}

function isAssistantMessage(value: unknown): boolean {
  return isRecord(value) && value.role === "assistant";
}

function readString(value: unknown, key: string): string | undefined {
  return isRecord(value) && typeof value[key] === "string" ? (value[key] as string) : undefined;
}

function readNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function readStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function readContentText(value: unknown): string {
  if (typeof value === "string") return value;
  if (!Array.isArray(value)) return "";
  return value.flatMap((part) => (isRecord(part) && part.type === "text" && typeof part.text === "string" ? [part.text] : [])).join("\n");
}

function readResultText(value: unknown): string | undefined {
  if (!isRecord(value)) return undefined;
  return readContentText(value.content) || undefined;
}

function formatExtensionError(value: unknown): string | undefined {
  if (!isRecord(value)) return undefined;
  return (
    [readString(value, "extensionPath"), readString(value, "event"), readString(value, "stack")].filter(Boolean).join("\n") || undefined
  );
}

function formatUnknown(value: unknown): string {
  if (typeof value === "string") return value;
  if (value === undefined) return "";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
