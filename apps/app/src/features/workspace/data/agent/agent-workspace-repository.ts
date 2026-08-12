import { isA2uiToolDetails, type RuntimeSnapshotDto } from "@pi/shared";
import type { AgentClient } from "../../../../agent/agent-client";
import type { Conversation, Message } from "../../domain";
import { workspaceData } from "../workspace-data";
import type { WorkspaceRepository } from "../workspace-repository";

export class AgentWorkspaceRepository implements WorkspaceRepository {
  private runtime?: Promise<RuntimeSnapshotDto>;
  private latestSnapshot?: RuntimeSnapshotDto;
  private unsubscribe?: () => void;
  private onTextDelta?: (delta: string) => void;

  constructor(
    private readonly client: AgentClient,
    private readonly cwd: string,
  ) {}

  async getConversation(conversationId: string, signal?: AbortSignal): Promise<Conversation> {
    this.assertConversation(conversationId);
    const snapshot = this.latestSnapshot ?? await this.ensureRuntime(signal);
    return snapshotToConversation(conversationId, snapshot);
  }

  async sendMessage(
    conversationId: string,
    content: string,
    onTextDelta?: (delta: string) => void,
  ): Promise<string> {
    this.assertConversation(conversationId);
    const runtime = await this.ensureRuntime();
    this.onTextDelta = onTextDelta;
    let snapshot: RuntimeSnapshotDto;
    try {
      snapshot = await this.client.runtimes.prompt(runtime.runtimeSlotId, { message: content });
    } finally {
      this.onTextDelta = undefined;
    }
    this.latestSnapshot = snapshot;
    const reply = [...snapshotToMessages(snapshot.messages)].reverse()
      .find((message) => message.role === "assistant")?.content;
    if (!reply) throw new Error("AI did not return a text response");
    return reply;
  }

  dispose(): void {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
  }

  private async ensureRuntime(signal?: AbortSignal): Promise<RuntimeSnapshotDto> {
    if (!this.runtime) {
      this.runtime = this.client.runtimes.create({ cwd: this.cwd }, signal)
        .then((snapshot) => {
          this.latestSnapshot = snapshot;
          const subscription = this.client.realtime.subscribe(snapshot.runtimeSlotId, {
            onSnapshot: (nextSnapshot) => { this.latestSnapshot = nextSnapshot; },
            onEvent: (event) => {
              const delta = readAgentTextDelta(event.event, event.payload);
              if (delta) this.onTextDelta?.(delta);
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

export function readAgentTextDelta(event: string, payload: unknown): string | undefined {
  if (event !== "agent.event" || !isRecord(payload) || payload.type !== "message_update") {
    return undefined;
  }
  const update = payload.assistantMessageEvent;
  if (!isRecord(update) || update.type !== "text_delta" || typeof update.delta !== "string") {
    return undefined;
  }
  return update.delta;
}

export function snapshotToConversation(
  conversationId: string,
  snapshot: RuntimeSnapshotDto,
): Conversation {
  return {
    ...workspaceData.conversation,
    id: conversationId,
    title: snapshot.sessionName ?? workspaceData.conversation.title,
    processingLabel: snapshot.isStreaming ? "正在生成" : "已就绪",
    messages: snapshotToMessages(snapshot.messages),
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
    const content = readTextContent(value.content);
    if (!content) return;
    const timestamp = typeof value.timestamp === "number" ? value.timestamp : Date.now();
    messages.push({
      id: `pi-message-${timestamp}-${index}`,
      role: value.role,
      content,
      status: value.role === "assistant" && value.stopReason === "error" ? "failed" : "complete",
      createdAt: new Date(timestamp).toISOString(),
    });
  });
  return messages;
}

function readTextContent(value: unknown): string {
  if (typeof value === "string") return value;
  if (!Array.isArray(value)) return "";
  return value.flatMap((part) =>
    isRecord(part) && part.type === "text" && typeof part.text === "string" ? [part.text] : []
  ).join("\n");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
