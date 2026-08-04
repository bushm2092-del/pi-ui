import type { WorkspaceRepository } from "../workspace-repository";
import { workspaceData } from "../workspace-data";

const MOCK_REPLY_DELAY_MS = 450;

export const mockWorkspaceRepository: WorkspaceRepository = {
  async getConversation(conversationId) {
    if (conversationId !== workspaceData.conversation.id) {
      throw new Error(`Conversation not found: ${conversationId}`);
    }

    return structuredClone(workspaceData.conversation);
  },
  async sendMessage(_conversationId, content) {
    await new Promise((resolve) => setTimeout(resolve, MOCK_REPLY_DELAY_MS));
    const escapedContent = content.replaceAll("*", "\\*");

    return [
      "这是来自 Mock repository 的助手回复。",
      "",
      `你刚才发送了：**${escapedContent}**`,
      "",
      "- 消息现在以原始 Markdown 保存",
      "- UI 不依赖具体后端实现",
      "- 后续可替换为 Agent Client 或 WebSocket",
    ].join("\n");
  },
};
