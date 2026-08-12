import type {
  ConversationActionDto,
  PinConversationDto,
  ProjectConversationsDto,
  SidebarConversationDto,
  SyncConversationDto,
} from "@pi/shared";
import type { Socket } from "socket.io";
import { ExceptionInterceptor, type SocketAck } from "../Interceptor/exception-interceptor.js";
import { ConversationService } from "../Service/conversation-service.js";
import type { SocketController } from "./socket-controller.js";

export class ConversationController implements SocketController {
  constructor(
    private readonly service: ConversationService,
    private readonly interceptor: ExceptionInterceptor,
  ) {}
  register(socket: Socket): void {
    socket.on("conversation:list", (_input: null, ack: SocketAck<{ pinned: SidebarConversationDto[]; recent: SidebarConversationDto[] }>) =>
      this.interceptor.execute(ack, () => ({ pinned: this.service.listPinned(), recent: this.service.listRecent() })),
    );
    socket.on("conversation:listByProject", (input: ProjectConversationsDto, ack: SocketAck<SidebarConversationDto[]>) =>
      this.interceptor.execute(ack, () => this.service.listByProject(input)),
    );
    socket.on("conversation:sync", (input: SyncConversationDto, ack: SocketAck<SidebarConversationDto>) =>
      this.interceptor.execute(ack, () => this.service.sync(input)),
    );
    socket.on("conversation:pin", (input: PinConversationDto, ack: SocketAck<null>) =>
      this.interceptor.execute(ack, () => {
        this.service.setPinned(input.conversationId, input.pinned);
        return null;
      }),
    );
    socket.on("conversation:archive", (input: ConversationActionDto, ack: SocketAck<null>) =>
      this.interceptor.execute(ack, () => {
        this.service.archive(input.conversationId);
        return null;
      }),
    );
    socket.on("conversation:read", (input: ConversationActionDto, ack: SocketAck<null>) =>
      this.interceptor.execute(ack, () => {
        this.service.markRead(input.conversationId);
        return null;
      }),
    );
  }
}
