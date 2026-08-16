import { SocketClient } from "./socket-client";
import type {
  ProjectConversationsDto,
  SidebarConversationDto,
  SidebarDto,
  SyncConversationDto,
} from "@pi/shared";

export class ConversationApi {
  constructor(private readonly client: SocketClient) {}

  list(): Promise<Pick<SidebarDto, "pinned" | "recent">> {
    return this.client.request("conversation:list", null);
  }

  sync(input: SyncConversationDto): Promise<SidebarConversationDto> {
    return this.client.request("conversation:sync", input);
  }

  listByProject(input: ProjectConversationsDto): Promise<SidebarConversationDto[]> {
    return this.client.request("conversation:listByProject", input);
  }

  async pin(conversationId: string, pinned: boolean): Promise<void> {
    await this.client.request<null>("conversation:pin", { conversationId, pinned });
  }

  async archive(conversationId: string): Promise<void> {
    await this.client.request<null>("conversation:archive", { conversationId });
  }

  async markRead(conversationId: string): Promise<void> {
    await this.client.request<null>("conversation:read", { conversationId });
  }
}
