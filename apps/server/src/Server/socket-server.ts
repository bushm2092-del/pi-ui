import { createServer, type Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import type { SocketController } from "../Controller/socket-controller.js";
import { SocketRouter } from "../Controller/socket-router.js";
import { ExceptionInterceptor } from "../Interceptor/exception-interceptor.js";
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
  #httpServer?: HttpServer;

  constructor(private readonly options: SocketServerOptions) {}

  async start(): Promise<SocketServerAddress> {
    if (this.#io) throw new Error("Socket server is already started");

    const httpServer = createServer();
    const io = new Server(httpServer, {
      transports: ["websocket"],
      serveClient: false,
    });

    new TokenInterceptor(this.options.token).install(io.of("/"));
    const router = new SocketRouter(new ExceptionInterceptor());
    io.on("connection", (socket) => {
      for (const controller of this.options.controllers) controller.register(socket, router);
    });

    this.#io = io;
    this.#httpServer = httpServer;
    await new Promise<void>((resolve, reject) => {
      httpServer.once("listening", resolve);
      httpServer.once("error", reject);
      httpServer.listen(this.options.port ?? 0, this.options.host);
    });

    const address = httpServer.address();
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
    this.#httpServer = undefined;
    if (io) await new Promise<void>((resolve) => io.close(() => resolve()));
  }
}
