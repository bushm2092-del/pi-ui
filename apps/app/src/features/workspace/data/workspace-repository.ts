export interface WorkspaceRepository {
  sendMessage(conversationId: string, content: string): Promise<string>;
}
