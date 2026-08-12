import type { JsonValue } from "./json.js";

export interface ErrorVO {
  code: string;
  message: string;
  retryable: boolean;
  details?: JsonValue;
}

export type ResultVO<T> = { success: true; data: T } | { success: false; error: ErrorVO };
