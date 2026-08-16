import type { Socket } from "socket.io";
import { ExceptionInterceptor, type SocketAck } from "../Interceptor/exception-interceptor.js";

export type SocketOperation<TInput, TOutput> = (
  input: TInput,
  socket: Socket,
) => TOutput | Promise<TOutput>;

/**
 * Centralizes socket event registration and cross-cutting concerns.
 * Controllers declare routes without touching the exception interceptor.
 */
export class SocketRouter {
  constructor(private readonly interceptor: ExceptionInterceptor) {}

  on<TInput, TOutput>(
    socket: Socket,
    event: string,
    operation: SocketOperation<TInput, TOutput>,
  ): void {
    socket.on(event, (input: TInput, ack: SocketAck<TOutput>) => {
      this.interceptor.execute(ack, () => operation(input, socket));
    });
  }
}
