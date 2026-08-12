import { Server } from "socket.io";
import type { SocketController } from "../Controller/socket-controller.js";
import { TokenInterceptor } from "../Interceptor/token-interceptor.js";

export interface SocketServerOptions {
  token: string;
  host?: string;
  port?: number;
  controllers: SocketController[];
}

export interface SocketServerAddress {
  host: string;
  port: number;
  socketUrl: string;
}

export class SocketServer {
  #io?: Server;

  constructor(private readonly options: SocketServerOptions) {}

  async start(): Promise<SocketServerAddress> {
    if (this.#io) throw new Error("Socket server is already started");

    const io = new Server({
      transports: ["websocket"],
      serveClient: false,
    });

    new TokenInterceptor(this.options.token).install(io.of("/"));
    io.on("connection", (socket) => {
      for (const controller of this.options.controllers) controller.register(socket);
    });

    this.#io = io;
    io.listen(this.options.port ?? 0);
    await new Promise<void>((resolve, reject) => {
      const server = io.httpServer;
      if (server.listening) return resolve();
      server.once("listening", resolve);
      server.once("error", reject);
    });

    const address = io.httpServer.address();
    if (!address || typeof address === "string") throw new Error("Socket server did not expose a TCP address");
    const host = address.address;
    const displayHost = address.family === "IPv6" ? `[${host}]` : host;
    return { host, port: address.port, socketUrl: `ws://${displayHost}:${address.port}` };
  }

  emitToRoom(room: string, event: string, payload: unknown): void {
    this.#io?.to(room).emit(event, payload);
  }

  async stop(): Promise<void> {
    const io = this.#io;
    this.#io = undefined;
    if (io) await new Promise<void>((resolve) => io.close(() => resolve()));
  }
}
