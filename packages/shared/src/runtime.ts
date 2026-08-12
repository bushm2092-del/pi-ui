import type { JsonValue } from "./json.js";

export interface AgentBackendConnection {
  url: string;
  token: string;
}

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

export interface RuntimeEventDto {
  runtimeSlotId: string;
  event: string;
  payload: JsonValue;
}

export type RuntimeSlotState = "stopped" | "starting" | "ready" | "running" | "replacing" |
  "stopping" | "interrupted" | "recovering" | "unavailable";

export interface RuntimeDiagnosticDto {
  type: "info" | "warning" | "error";
  message: string;
}

export interface RuntimeSnapshotDto {
  runtimeSlotId: string;
  state: RuntimeSlotState;
  cwd: string;
  sessionId: string;
  sessionFile?: string;
  sessionName?: string;
  isStreaming: boolean;
  model?: { provider: string; id: string };
  thinkingLevel: string;
  messages: JsonValue[];
  diagnostics: RuntimeDiagnosticDto[];
}

export interface ProtocolErrorDto {
  code: string;
  message: string;
  retryable: boolean;
  details?: JsonValue;
}
