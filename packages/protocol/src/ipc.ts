import type { JsonValue } from "./json.js";
import { isJsonValue } from "./json.js";
import type { ProtocolErrorDto, RuntimeSnapshotDto } from "./runtime.js";

export const IPC_PROTOCOL_VERSION = 1 as const;

export interface WorkerCommandPayloads {
  "runtime.initialize": {
    runtimeSlotId: string;
    cwd: string;
    agentDir?: string;
    sessionFile?: string;
  };
  "runtime.get_snapshot": Record<string, never>;
  "runtime.prompt": {
    message: string;
    streamingBehavior?: "steer" | "followUp";
  };
  "runtime.abort": Record<string, never>;
  "runtime.set_session_name": { name: string };
  "runtime.shutdown": Record<string, never>;
}

export type WorkerCommandMethod = keyof WorkerCommandPayloads;

export type WorkerCommand<M extends WorkerCommandMethod = WorkerCommandMethod> = M extends WorkerCommandMethod
  ? {
      v: typeof IPC_PROTOCOL_VERSION;
      kind: "command";
      operationId: string;
      method: M;
      payload: WorkerCommandPayloads[M];
    }
  : never;

export type ControlToWorkerMessage = {
  [M in WorkerCommandMethod]: WorkerCommand<M>;
}[WorkerCommandMethod];

export interface WorkerResultMessage {
  v: typeof IPC_PROTOCOL_VERSION;
  kind: "result";
  operationId: string;
  ok: boolean;
  data?: JsonValue;
  error?: ProtocolErrorDto;
}

export interface WorkerEventMessage {
  v: typeof IPC_PROTOCOL_VERSION;
  kind: "event";
  streamId: string;
  cursor: number;
  runtimeSlotId?: string;
  event: string;
  payload: JsonValue;
}

export interface WorkerHeartbeatMessage {
  v: typeof IPC_PROTOCOL_VERSION;
  kind: "heartbeat";
  workerId: string;
  timestamp: number;
}

export interface WorkerReadyMessage {
  v: typeof IPC_PROTOCOL_VERSION;
  kind: "ready";
  workerId: string;
  pid: number;
}

export type WorkerToControlMessage =
  | WorkerResultMessage
  | WorkerEventMessage
  | WorkerHeartbeatMessage
  | WorkerReadyMessage;

export class ProtocolValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProtocolValidationError";
  }
}

export function createWorkerCommand<M extends WorkerCommandMethod>(
  method: M,
  payload: WorkerCommandPayloads[M],
  operationId: string = globalThis.crypto.randomUUID()
): WorkerCommand<M> {
  return { v: IPC_PROTOCOL_VERSION, kind: "command", operationId, method, payload } as WorkerCommand<M>;
}

export function createWorkerResult(
  operationId: string,
  result: { data?: JsonValue } | { error: ProtocolErrorDto }
): WorkerResultMessage {
  if ("error" in result) {
    return { v: IPC_PROTOCOL_VERSION, kind: "result", operationId, ok: false, error: result.error };
  }
  return { v: IPC_PROTOCOL_VERSION, kind: "result", operationId, ok: true, data: result.data };
}

export function parseControlToWorkerMessage(value: unknown): ControlToWorkerMessage {
  const message = readRecord(value, "Worker command must be an object");
  assertVersionAndKind(message, "command");
  const operationId = readString(message.operationId, "operationId");
  const method = readString(message.method, "method") as WorkerCommandMethod;
  const payload = readRecord(message.payload, "payload must be an object");

  switch (method) {
    case "runtime.initialize":
      return createParsedCommand(operationId, method, {
        runtimeSlotId: readString(payload.runtimeSlotId, "payload.runtimeSlotId"),
        cwd: readString(payload.cwd, "payload.cwd"),
        agentDir: readOptionalString(payload.agentDir, "payload.agentDir"),
        sessionFile: readOptionalString(payload.sessionFile, "payload.sessionFile")
      });
    case "runtime.prompt": {
      const streamingBehavior = payload.streamingBehavior;
      if (streamingBehavior !== undefined && streamingBehavior !== "steer" && streamingBehavior !== "followUp") {
        throw new ProtocolValidationError("payload.streamingBehavior must be steer or followUp");
      }
      return createParsedCommand(operationId, method, {
        message: readString(payload.message, "payload.message"),
        streamingBehavior
      });
    }
    case "runtime.set_session_name":
      return createParsedCommand(operationId, method, {
        name: readString(payload.name, "payload.name")
      });
    case "runtime.get_snapshot":
    case "runtime.abort":
    case "runtime.shutdown":
      return createParsedCommand(operationId, method, {});
    default:
      throw new ProtocolValidationError(`Unsupported worker command: ${method}`);
  }
}

export function parseWorkerToControlMessage(value: unknown): WorkerToControlMessage {
  const message = readRecord(value, "Worker message must be an object");
  if (message.v !== IPC_PROTOCOL_VERSION) throw new ProtocolValidationError("Unsupported IPC protocol version");
  const kind = readString(message.kind, "kind");

  if (kind === "ready") {
    return {
      v: IPC_PROTOCOL_VERSION,
      kind,
      workerId: readString(message.workerId, "workerId"),
      pid: readFiniteNumber(message.pid, "pid")
    };
  }
  if (kind === "heartbeat") {
    return {
      v: IPC_PROTOCOL_VERSION,
      kind,
      workerId: readString(message.workerId, "workerId"),
      timestamp: readFiniteNumber(message.timestamp, "timestamp")
    };
  }
  if (kind === "event") {
    if (!isJsonValue(message.payload)) throw new ProtocolValidationError("event payload must be JSON-compatible");
    return {
      v: IPC_PROTOCOL_VERSION,
      kind,
      streamId: readString(message.streamId, "streamId"),
      cursor: readFiniteNumber(message.cursor, "cursor"),
      runtimeSlotId: readOptionalString(message.runtimeSlotId, "runtimeSlotId"),
      event: readString(message.event, "event"),
      payload: message.payload
    };
  }
  if (kind === "result") {
    const ok = message.ok;
    if (typeof ok !== "boolean") throw new ProtocolValidationError("result.ok must be a boolean");
    const base = {
      v: IPC_PROTOCOL_VERSION,
      kind: "result" as const,
      operationId: readString(message.operationId, "operationId"),
      ok
    };
    if (ok) {
      if (message.data !== undefined && !isJsonValue(message.data)) {
        throw new ProtocolValidationError("result.data must be JSON-compatible");
      }
      return { ...base, ok: true, data: message.data as JsonValue | undefined };
    }
    return { ...base, ok: false, error: parseProtocolError(message.error) };
  }
  throw new ProtocolValidationError(`Unsupported worker message kind: ${kind}`);
}

export function isRuntimeSnapshotDto(value: JsonValue | undefined): value is RuntimeSnapshotDto & JsonValue {
  if (!value || Array.isArray(value) || typeof value !== "object") return false;
  return (
    typeof value.runtimeSlotId === "string" &&
    typeof value.sessionId === "string" &&
    typeof value.cwd === "string" &&
    isRuntimeSlotState(value.state) &&
    typeof value.isStreaming === "boolean" &&
    typeof value.thinkingLevel === "string" &&
    Array.isArray(value.messages) &&
    Array.isArray(value.diagnostics) &&
    (value.sessionFile === undefined || typeof value.sessionFile === "string") &&
    (value.sessionName === undefined || typeof value.sessionName === "string")
  );
}

function isRuntimeSlotState(value: unknown): boolean {
  return value === "stopped" || value === "starting" || value === "ready" || value === "running" ||
    value === "replacing" || value === "stopping" || value === "interrupted" || value === "recovering" ||
    value === "unavailable";
}

function createParsedCommand<M extends WorkerCommandMethod>(
  operationId: string,
  method: M,
  payload: WorkerCommandPayloads[M]
): WorkerCommand<M> {
  return { v: IPC_PROTOCOL_VERSION, kind: "command", operationId, method, payload } as WorkerCommand<M>;
}

function parseProtocolError(value: unknown): ProtocolErrorDto {
  const error = readRecord(value, "result.error must be an object");
  if (typeof error.retryable !== "boolean") throw new ProtocolValidationError("error.retryable must be a boolean");
  if (error.details !== undefined && !isJsonValue(error.details)) {
    throw new ProtocolValidationError("error.details must be JSON-compatible");
  }
  return {
    code: readString(error.code, "error.code"),
    message: readString(error.message, "error.message"),
    retryable: error.retryable,
    details: error.details as JsonValue | undefined
  };
}

function assertVersionAndKind(record: Record<string, unknown>, kind: string): void {
  if (record.v !== IPC_PROTOCOL_VERSION) throw new ProtocolValidationError("Unsupported IPC protocol version");
  if (record.kind !== kind) throw new ProtocolValidationError(`Expected ${kind} message`);
}

function readRecord(value: unknown, message: string): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new ProtocolValidationError(message);
  }
  return value as Record<string, unknown>;
}

function readString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new ProtocolValidationError(`${field} must be a non-empty string`);
  }
  return value;
}

function readOptionalString(value: unknown, field: string): string | undefined {
  return value === undefined ? undefined : readString(value, field);
}

function readFiniteNumber(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new ProtocolValidationError(`${field} must be a finite number`);
  }
  return value;
}
