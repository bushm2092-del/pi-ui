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

export interface RuntimeDiagnosticDto {
  type: "info" | "warning" | "error";
  message: string;
}

export interface RuntimeSnapshotDto {
  runtimeSlotId: string;
  cwd: string;
  sessionId: string;
  sessionFile?: string;
  sessionName?: string;
  isStreaming: boolean;
  isIdle: boolean;
  isCompacting: boolean;
  retryAttempt: number;
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
