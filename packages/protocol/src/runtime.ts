import type { JsonValue } from "./json.js";

export type RuntimeSlotState =
  | "stopped"
  | "starting"
  | "ready"
  | "running"
  | "replacing"
  | "stopping"
  | "interrupted"
  | "recovering"
  | "unavailable";

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
