import { timingSafeEqual } from "node:crypto";
import type { Namespace, Socket } from "socket.io";

export class TokenInterceptor {
  readonly #token: Buffer;

  constructor(token: string) {
    if (!token) throw new Error("Socket token must not be empty");
    this.#token = Buffer.from(token);
  }

  install(namespace: Namespace): void {
    namespace.use((socket, next) => next(this.#authorize(socket) ? undefined : new Error("unauthorized")));
  }

  #authorize(socket: Socket): boolean {
    const candidate = socket.handshake.auth.token;
    if (typeof candidate !== "string") return false;
    const value = Buffer.from(candidate);
    return value.length === this.#token.length && timingSafeEqual(value, this.#token);
  }
}
