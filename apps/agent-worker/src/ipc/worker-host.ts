import { randomUUID } from "node:crypto";
import type { JsonValue, ProtocolErrorDto, WorkerToControlMessage } from "@pi/protocol";
import {
  IPC_PROTOCOL_VERSION,
  ProtocolValidationError,
  createWorkerResult,
  parseControlToWorkerMessage
} from "@pi/protocol";
import { toJsonValue } from "@pi/pi-adapter";
import { RuntimeSlot, RuntimeSlotError } from "../runtime/runtime-slot.js";

export type WorkerMessageSender = (message: WorkerToControlMessage) => void;

export class WorkerHost {
  readonly workerId = randomUUID();
  readonly runtimeSlot: RuntimeSlot;
  #heartbeat?: NodeJS.Timeout;

  constructor(private readonly send: WorkerMessageSender) {
    this.runtimeSlot = new RuntimeSlot((event) => this.send(event));
  }

  startHeartbeat(intervalMs = 5_000): void {
    if (this.#heartbeat) return;
    this.#heartbeat = setInterval(() => {
      this.send({
        v: IPC_PROTOCOL_VERSION,
        kind: "heartbeat",
        workerId: this.workerId,
        timestamp: Date.now()
      });
    }, intervalMs);
    this.#heartbeat.unref();
  }

  stopHeartbeat(): void {
    if (!this.#heartbeat) return;
    clearInterval(this.#heartbeat);
    this.#heartbeat = undefined;
  }

  async receive(value: unknown): Promise<void> {
    let command;
    try {
      command = parseControlToWorkerMessage(value);
    } catch (error) {
      const operationId = readOperationId(value);
      if (operationId) this.send(createWorkerResult(operationId, { error: toProtocolError(error) }));
      return;
    }

    try {
      let data: JsonValue | undefined;
      switch (command.method) {
        case "runtime.initialize":
          data = toJsonValue(await this.runtimeSlot.initialize(command.payload));
          break;
        case "runtime.get_snapshot":
          data = toJsonValue(this.runtimeSlot.snapshot());
          break;
        case "runtime.prompt":
          data = toJsonValue(await this.runtimeSlot.prompt(
            command.operationId,
            command.payload.message,
            command.payload.streamingBehavior
          ));
          break;
        case "runtime.abort":
          data = toJsonValue(await this.runtimeSlot.abort());
          break;
        case "runtime.set_session_name":
          data = toJsonValue(this.runtimeSlot.setSessionName(command.payload.name));
          break;
        case "runtime.shutdown":
          await this.runtimeSlot.shutdown();
          break;
      }
      this.send(createWorkerResult(command.operationId, { data }));
    } catch (error) {
      this.send(createWorkerResult(command.operationId, { error: toProtocolError(error) }));
    }
  }

  async dispose(): Promise<void> {
    this.stopHeartbeat();
    await this.runtimeSlot.shutdown();
  }
}

function toProtocolError(error: unknown): ProtocolErrorDto {
  if (error instanceof RuntimeSlotError) {
    return { code: error.code, message: error.message, retryable: error.retryable };
  }
  if (error instanceof ProtocolValidationError) {
    return { code: "invalid_worker_command", message: error.message, retryable: false };
  }
  return {
    code: "worker_operation_failed",
    message: error instanceof Error ? error.message : String(error),
    retryable: false
  };
}

function readOperationId(value: unknown): string | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const operationId = (value as Record<string, unknown>).operationId;
  return typeof operationId === "string" && operationId.length > 0 ? operationId : undefined;
}
