import type { Conversation } from "../domain";

export interface WorkspaceRepository {
  getConversation(conversationId: string, signal?: AbortSignal): Promise<Conversation>;
  sendMessage(
    conversationId: string,
    content: string,
  ): Promise<string>;
  abortMessage?(conversationId: string): Promise<void>;
}
