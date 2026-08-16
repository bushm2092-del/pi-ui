import type { Socket } from "socket.io";
import type { SocketRouter } from "./socket-router.js";

export interface SocketController {
  register(socket: Socket, router: SocketRouter): void;
}
