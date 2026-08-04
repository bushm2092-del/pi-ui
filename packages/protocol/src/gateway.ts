import { isJsonValue, type JsonValue } from "./json.js";
import { isRuntimeSnapshotDto } from "./ipc.js";
import type { RuntimeSnapshotDto } from "./runtime.js";

export const GATEWAY_PROTOCOL_VERSION = 1 as const;

export interface CreateRuntimeRequestDto {
  runtimeSlotId?: string;
  cwd: string;
  agentDir?: string;
  sessionFile?: string;
}

export interface PromptRuntimeRequestDto {
  message: string;
  streamingBehavior?: "steer" | "followUp";
}

export interface RenameRuntimeRequestDto {
  sessionName: string;
}

export interface ApiErrorDto {
  error: {
    code: string;
    message: string;
    retryable: boolean;
    requestId: string;
  };
}

export type GatewayClientMessage =
  | {
      v: typeof GATEWAY_PROTOCOL_VERSION;
      kind: "subscribe";
      subscriptionId: string;
      runtimeSlotId: string;
      resume?: { streamId: string; afterCursor: number };
    }
  | {
      v: typeof GATEWAY_PROTOCOL_VERSION;
      kind: "unsubscribe";
      subscriptionId: string;
    }
  | {
      v: typeof GATEWAY_PROTOCOL_VERSION;
      kind: "ping";
      requestId: string;
    };

export type GatewayServerMessage =
  | {
      v: typeof GATEWAY_PROTOCOL_VERSION;
      kind: "connection.ready";
      connectionId: string;
      heartbeatIntervalMs: number;
    }
  | {
      v: typeof GATEWAY_PROTOCOL_VERSION;
      kind: "subscription.ready";
      subscriptionId: string;
      runtimeSlotId: string;
      snapshot: RuntimeSnapshotDto;
      streamId?: string;
      latestCursor?: number;
    }
  | {
      v: typeof GATEWAY_PROTOCOL_VERSION;
      kind: "subscription.reset_required";
      subscriptionId: string;
      runtimeSlotId: string;
      snapshot: RuntimeSnapshotDto;
      reason: "stream_missing" | "cursor_expired" | "stream_replaced";
    }
  | {
      v: typeof GATEWAY_PROTOCOL_VERSION;
      kind: "runtime.event";
      subscriptionId: string;
      streamId: string;
      cursor: number;
      runtimeSlotId: string;
      event: string;
      payload: import("./json.js").JsonValue;
    }
  | {
      v: typeof GATEWAY_PROTOCOL_VERSION;
      kind: "pong";
      requestId: string;
    }
  | {
      v: typeof GATEWAY_PROTOCOL_VERSION;
      kind: "error";
      code: string;
      message: string;
      retryable: boolean;
      subscriptionId?: string;
    };

export class GatewayProtocolValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GatewayProtocolValidationError";
  }
}

export function parseGatewayClientMessage(value: unknown): GatewayClientMessage {
  const message = readRecord(value, "Gateway message must be an object");
  if (message.v !== GATEWAY_PROTOCOL_VERSION) {
    throw new GatewayProtocolValidationError("Unsupported gateway protocol version");
  }
  const kind = readString(message.kind, "kind");
  if (kind === "subscribe") {
    const resume = message.resume === undefined ? undefined : readResume(message.resume);
    return {
      v: GATEWAY_PROTOCOL_VERSION,
      kind,
      subscriptionId: readString(message.subscriptionId, "subscriptionId"),
      runtimeSlotId: readString(message.runtimeSlotId, "runtimeSlotId"),
      resume
    };
  }
  if (kind === "unsubscribe") {
    return {
      v: GATEWAY_PROTOCOL_VERSION,
      kind,
      subscriptionId: readString(message.subscriptionId, "subscriptionId")
    };
  }
  if (kind === "ping") {
    return {
      v: GATEWAY_PROTOCOL_VERSION,
      kind,
      requestId: readString(message.requestId, "requestId")
    };
  }
  throw new GatewayProtocolValidationError(`Unsupported gateway message kind: ${kind}`);
}

export function parseGatewayServerMessage(value: unknown): GatewayServerMessage {
  const message = readRecord(value, "Gateway message must be an object");
  if (message.v !== GATEWAY_PROTOCOL_VERSION) {
    throw new GatewayProtocolValidationError("Unsupported gateway protocol version");
  }
  const kind = readString(message.kind, "kind");
  if (kind === "connection.ready") {
    return {
      v: GATEWAY_PROTOCOL_VERSION,
      kind,
      connectionId: readString(message.connectionId, "connectionId"),
      heartbeatIntervalMs: readNonNegativeInteger(message.heartbeatIntervalMs, "heartbeatIntervalMs")
    };
  }
  if (kind === "subscription.ready") {
    return {
      v: GATEWAY_PROTOCOL_VERSION,
      kind,
      subscriptionId: readString(message.subscriptionId, "subscriptionId"),
      runtimeSlotId: readString(message.runtimeSlotId, "runtimeSlotId"),
      snapshot: readSnapshot(message.snapshot),
      streamId: readOptionalString(message.streamId, "streamId"),
      latestCursor: readOptionalNonNegativeInteger(message.latestCursor, "latestCursor")
    };
  }
  if (kind === "subscription.reset_required") {
    const reason = message.reason;
    if (reason !== "stream_missing" && reason !== "cursor_expired" && reason !== "stream_replaced") {
      throw new GatewayProtocolValidationError("reason must be stream_missing, cursor_expired, or stream_replaced");
    }
    return {
      v: GATEWAY_PROTOCOL_VERSION,
      kind,
      subscriptionId: readString(message.subscriptionId, "subscriptionId"),
      runtimeSlotId: readString(message.runtimeSlotId, "runtimeSlotId"),
      snapshot: readSnapshot(message.snapshot),
      reason
    };
  }
  if (kind === "runtime.event") {
    if (!isJsonValue(message.payload)) {
      throw new GatewayProtocolValidationError("payload must be JSON-compatible");
    }
    return {
      v: GATEWAY_PROTOCOL_VERSION,
      kind,
      subscriptionId: readString(message.subscriptionId, "subscriptionId"),
      streamId: readString(message.streamId, "streamId"),
      cursor: readNonNegativeInteger(message.cursor, "cursor"),
      runtimeSlotId: readString(message.runtimeSlotId, "runtimeSlotId"),
      event: readString(message.event, "event"),
      payload: message.payload
    };
  }
  if (kind === "pong") {
    return {
      v: GATEWAY_PROTOCOL_VERSION,
      kind,
      requestId: readString(message.requestId, "requestId")
    };
  }
  if (kind === "error") {
    if (typeof message.retryable !== "boolean") {
      throw new GatewayProtocolValidationError("retryable must be a boolean");
    }
    return {
      v: GATEWAY_PROTOCOL_VERSION,
      kind,
      code: readString(message.code, "code"),
      message: readString(message.message, "message"),
      retryable: message.retryable,
      subscriptionId: readOptionalString(message.subscriptionId, "subscriptionId")
    };
  }
  throw new GatewayProtocolValidationError(`Unsupported gateway message kind: ${kind}`);
}

function readResume(value: unknown): { streamId: string; afterCursor: number } {
  const resume = readRecord(value, "resume must be an object");
  const afterCursor = resume.afterCursor;
  if (typeof afterCursor !== "number" || !Number.isInteger(afterCursor) || afterCursor < 0) {
    throw new GatewayProtocolValidationError("resume.afterCursor must be a non-negative integer");
  }
  return { streamId: readString(resume.streamId, "resume.streamId"), afterCursor };
}

function readRecord(value: unknown, message: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new GatewayProtocolValidationError(message);
  }
  return value as Record<string, unknown>;
}

function readString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new GatewayProtocolValidationError(`${field} must be a non-empty string`);
  }
  return value;
}

function readOptionalString(value: unknown, field: string): string | undefined {
  return value === undefined ? undefined : readString(value, field);
}

function readNonNegativeInteger(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new GatewayProtocolValidationError(`${field} must be a non-negative integer`);
  }
  return value;
}

function readOptionalNonNegativeInteger(value: unknown, field: string): number | undefined {
  return value === undefined ? undefined : readNonNegativeInteger(value, field);
}

function readSnapshot(value: unknown): RuntimeSnapshotDto {
  if (!isJsonValue(value) || !isRuntimeSnapshotDto(value)) {
    throw new GatewayProtocolValidationError("snapshot must be a valid RuntimeSnapshot");
  }
  return value;
}
