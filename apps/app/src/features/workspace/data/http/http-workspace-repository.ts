import type { Conversation } from "../../domain";
import type { WorkspaceRepository } from "../workspace-repository";

export class HttpWorkspaceRepository implements WorkspaceRepository {
  constructor(
    private readonly baseUrl: string,
    private readonly request: typeof fetch = fetch,
  ) {}

  async getConversation(conversationId: string, signal?: AbortSignal) {
    return this.requestJson<Conversation>(
      `/conversations/${encodeURIComponent(conversationId)}`,
      { signal },
    );
  }

  async sendMessage(conversationId: string, content: string) {
    const response = await this.requestJson<{ reply: string }>(
      `/conversations/${encodeURIComponent(conversationId)}/messages`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content }),
      },
    );
    return response.reply;
  }

  private async requestJson<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await this.request(`${this.baseUrl}${path}`, init);
    if (!response.ok) {
      throw new Error(`Workspace request failed with status ${response.status}`);
    }
    return response.json() as Promise<T>;
  }
}
