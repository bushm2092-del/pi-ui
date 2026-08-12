import type { ResultVO } from "@pi/shared";
import { BusinessException } from "../Exception/business-exception.js";

export type SocketAck<T> = (result: ResultVO<T>) => void;

export class ExceptionInterceptor {
  execute<T>(ack: SocketAck<T>, operation: () => T | Promise<T>): void {
    void this.#execute(ack, operation);
  }

  async #execute<T>(ack: SocketAck<T>, operation: () => T | Promise<T>): Promise<void> {
    try {
      ack({ success: true, data: await operation() });
    } catch (error) {
      const exception = this.#normalize(error);
      ack({
        success: false,
        error: {
          code: exception.code,
          message: exception.message,
          retryable: exception.retryable,
          details: exception.details,
        },
      });
    }
  }

  #normalize(error: unknown): BusinessException {
    if (error instanceof BusinessException) return error;
    return new BusinessException("internal_server_error", error instanceof Error ? error.message : "Unknown server error");
  }
}
