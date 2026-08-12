import type { Socket } from "socket.io";

export interface SocketController {
  register(socket: Socket): void;
}
