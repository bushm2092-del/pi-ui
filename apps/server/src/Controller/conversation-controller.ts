import type {
  ConversationActionDto,
  PinConversationDto,
  ProjectConversationsDto,
  SidebarConversationDto,
  SyncConversationDto,
} from "@pi/shared";
import type { Socket } from "socket.io";
import type { SocketRouter } from "./socket-router.js";
import { ConversationService } from "../Service/conversation-service.js";
import type { SocketController } from "./socket-controller.js";

export class ConversationController implements SocketController {
  constructor(private readonly service: ConversationService) {}

  register(socket: Socket, router: SocketRouter): void {
    router.on<null, { pinned: SidebarConversationDto[]; recent: SidebarConversationDto[] }>(
      socket,
      "conversation:list",
      () => ({ pinned: this.service.listPinned(), recent: this.service.listRecent() }),
    );
    router.on<ProjectConversationsDto, SidebarConversationDto[]>(
      socket,
      "conversation:listByProject",
      (input) => this.service.listByProject(input),
    );
    router.on<SyncConversationDto, SidebarConversationDto>(
      socket,
      "conversation:sync",
      (input) => this.service.sync(input),
    );
    router.on<PinConversationDto, null>(socket, "conversation:pin", (input) => {
      this.service.setPinned(input.conversationId, input.pinned);
      return null;
    });
    router.on<ConversationActionDto, null>(socket, "conversation:archive", (input) => {
      this.service.archive(input.conversationId);
      return null;
    });
    router.on<ConversationActionDto, null>(socket, "conversation:read", (input) => {
      this.service.markRead(input.conversationId);
      return null;
    });
  }
}
