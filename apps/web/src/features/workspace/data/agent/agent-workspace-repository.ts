import { isA2uiToolDetails, type RuntimeSnapshotDto } from "@pi/shared";
import type { AgentClient } from "../../../../agent/agent-client";
import type { AssistantContentBlock, Conversation, Message } from "../../domain";
import { workspaceData } from "../workspace-data";
import type { WorkspaceRepository } from "../workspace-repository";
import type { QueryClient } from "@tanstack/react-query";
import { sidebarQueryKey } from "../../api/sidebar-hooks";
import { applyRuntimeEvent } from "./runtime-event-reducer";
import { toast } from "sonner";

export class AgentWorkspaceRepository implements WorkspaceRepository {
  private runtime?: Promise<RuntimeSnapshotDto>;
  private latestSnapshot?: RuntimeSnapshotDto;
  private unsubscribe?: () => void;

  constructor(
    private readonly client: AgentClient,
    private readonly cwd: string,
    private readonly queryClient: QueryClient,
  ) {}

  async getConversation(conversationId: string, signal?: AbortSignal): Promise<Conversation> {
    this.assertConversation(conversationId);
    const snapshot = this.latestSnapshot ?? (await this.ensureRuntime(signal));
    return snapshotToConversation(conversationId, snapshot);
  }

  async sendMessage(conversationId: string, content: string): Promise<string> {
    this.assertConversation(conversationId);
    const runtime = await this.ensureRuntime();
    const snapshot = await this.client.runtimes.prompt(runtime.runtimeSlotId, { message: content });
    this.latestSnapshot = snapshot;
    const reply = [...snapshotToMessages(snapshot.messages)].reverse().find((message) => message.role === "assistant")?.content;
    if (!reply) throw new Error("AI did not return a text response");
    return reply;
  }

  async abortMessage(conversationId: string): Promise<void> {
    this.assertConversation(conversationId);
    const runtime = await this.ensureRuntime();
    this.latestSnapshot = await this.client.runtimes.abort(runtime.runtimeSlotId);
  }

  dispose(): void {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
  }

  private async ensureRuntime(signal?: AbortSignal): Promise<RuntimeSnapshotDto> {
    if (!this.runtime) {
      this.runtime = this.client.runtimes
        .create({ cwd: this.cwd }, signal)
        .then(async (snapshot) => {
          const project = await this.client.projects.upsert({ name: projectName(this.cwd), cwd: this.cwd });
          await this.client.conversations.sync({
            id: workspaceData.conversation.id,
            projectId: project.id,
            piSessionId: snapshot.sessionId,
            sessionFile: snapshot.sessionFile,
            title: snapshot.sessionName ?? workspaceData.conversation.title,
            status: snapshot.isStreaming ? "running" : "idle",
          });
          await this.queryClient.invalidateQueries({ queryKey: sidebarQueryKey });
          this.latestSnapshot = snapshot;
          const subscription = this.client.realtime.subscribe(snapshot.runtimeSlotId, {
            onSnapshot: (nextSnapshot) => {
              this.latestSnapshot = nextSnapshot;
            },
            onEvent: (event) => {
              const queryKey = ["workspace", "conversation", workspaceData.conversation.id] as const;
              const current = this.queryClient.getQueryData<Conversation>(queryKey);
              if (event.event === "extension.error" && current?.runtime?.isStreaming !== true) {
                toast.error(readRecordString(event.payload, "message") ?? "扩展执行失败");
              }
              this.queryClient.setQueryData<Conversation>(queryKey, (current) => (current ? applyRuntimeEvent(current, event) : current));
              if (event.event === "agent.event" && isRecord(event.payload) && event.payload.type === "session_info_changed") {
                void this.queryClient.invalidateQueries({ queryKey: sidebarQueryKey });
              }
            },
          });
          this.unsubscribe = subscription.unsubscribe;
          return snapshot;
        })
        .catch((error) => {
          this.runtime = undefined;
          throw error;
        });
    }
    return this.runtime;
  }

  private assertConversation(conversationId: string): void {
    if (conversationId !== workspaceData.conversation.id) {
      throw new Error(`Conversation not found: ${conversationId}`);
    }
  }
}

export function snapshotToConversation(conversationId: string, snapshot: RuntimeSnapshotDto): Conversation {
  return {
    ...workspaceData.conversation,
    id: conversationId,
    title: snapshot.sessionName ?? workspaceData.conversation.title,
    processingLabel: snapshot.isStreaming ? "正在生成" : "已就绪",
    messages: snapshotToMessages(snapshot.messages),
    runtime: {
      isStreaming: snapshot.isStreaming,
      isIdle: snapshot.isIdle,
      isCompacting: snapshot.isCompacting,
      retryAttempt: snapshot.retryAttempt,
      steeringQueue: [],
      followUpQueue: [],
      messageSequence: 0,
      thinkingLevel: snapshot.thinkingLevel,
    },
  };
}

export function snapshotToMessages(values: RuntimeSnapshotDto["messages"]): Message[] {
  const messages: Message[] = [];
  values.forEach((value, index) => {
    if (isRecord(value) && value.role === "toolResult" && isA2uiToolDetails(value.details)) {
      const timestamp = typeof value.timestamp === "number" ? value.timestamp : Date.now();
      messages.push({
        id: `pi-a2ui-${value.toolCallId ?? timestamp}-${index}`,
        role: "a2ui",
        content: "",
        status: "complete",
        createdAt: new Date(timestamp).toISOString(),
        a2ui: value.details,
      });
      return;
    }
    if (!isRecord(value) || (value.role !== "user" && value.role !== "assistant")) return;
    const blocks = value.role === "assistant" ? readAssistantBlocks(value.content) : undefined;
    const content = readTextContent(value.content);
    if (!content && !blocks?.length) return;
    const timestamp = typeof value.timestamp === "number" ? value.timestamp : Date.now();
    messages.push({
      id: `pi-message-${timestamp}-${index}`,
      role: value.role,
      content,
      status:
        value.role === "assistant" && value.stopReason === "error"
          ? "failed"
          : value.role === "assistant" && value.stopReason === "aborted"
            ? "stopped"
            : "complete",
      createdAt: new Date(timestamp).toISOString(),
      blocks,
    });
  });
  return messages;
}

function readAssistantBlocks(value: unknown): AssistantContentBlock[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((part, contentIndex): AssistantContentBlock[] => {
    if (!isRecord(part) || typeof part.type !== "string") return [];
    if (part.type === "text" && typeof part.text === "string") {
      return [{ id: `snapshot-text-${contentIndex}`, type: "text", contentIndex, content: part.text }];
    }
    if (part.type === "thinking" && typeof part.thinking === "string") {
      return [{ id: `snapshot-thinking-${contentIndex}`, type: "thinking", contentIndex, content: part.thinking }];
    }
    if (part.type === "toolCall") {
      return [
        {
          id: `snapshot-tool-${contentIndex}`,
          type: "tool",
          contentIndex,
          toolCallId: typeof part.id === "string" ? part.id : undefined,
          name: typeof part.name === "string" ? part.name : "工具调用",
          status: "complete",
          arguments: part.arguments,
        },
      ];
    }
    return [];
  });
}

function readTextContent(value: unknown): string {
  if (typeof value === "string") return value;
  if (!Array.isArray(value)) return "";
  return value.flatMap((part) => (isRecord(part) && part.type === "text" && typeof part.text === "string" ? [part.text] : [])).join("\n");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readRecordString(value: unknown, key: string): string | undefined {
  return isRecord(value) && typeof value[key] === "string" ? (value[key] as string) : undefined;
}

function projectName(path: string): string {
  return (
    path
      .replace(/[\\/]+$/, "")
      .split(/[\\/]/)
      .pop() || path
  );
}
