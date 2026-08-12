import type { JsonValue } from "@pi/shared";

export class BusinessException extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly retryable = false,
    readonly details?: JsonValue,
  ) {
    super(message);
    this.name = "BusinessException";
  }
}
