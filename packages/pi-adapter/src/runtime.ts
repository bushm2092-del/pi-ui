import {
  type AgentSession,
  type AgentSessionEvent,
  type AgentSessionRuntime,
  type AgentSessionRuntimeDiagnostic,
  type CreateAgentSessionRuntimeFactory,
  SessionManager,
  createAgentSessionFromServices,
  createAgentSessionRuntime,
  createAgentSessionServices,
  getAgentDir
} from "@earendil-works/pi-coding-agent";
import type { JsonValue, RuntimeSlotState, RuntimeSnapshotDto } from "@pi/protocol";
import { toJsonValue } from "./json-value.js";

export interface CreatePiRuntimeOptions {
  cwd: string;
  agentDir?: string;
  sessionFile?: string;
}

export interface PiExtensionErrorDto {
  extensionPath: string;
  event: string;
  message: string;
  stack?: string;
}

export async function createPiRuntime(options: CreatePiRuntimeOptions): Promise<AgentSessionRuntime> {
  const agentDir = options.agentDir ?? getAgentDir();
  const sessionManager = options.sessionFile
    ? SessionManager.open(options.sessionFile)
    : SessionManager.create(options.cwd);
  const cwd = sessionManager.getCwd();

  const createRuntime: CreateAgentSessionRuntimeFactory = async ({
    cwd: effectiveCwd,
    sessionManager: effectiveSessionManager,
    sessionStartEvent
  }) => {
    const services = await createAgentSessionServices({ cwd: effectiveCwd, agentDir });
    return {
      ...(await createAgentSessionFromServices({
        services,
        sessionManager: effectiveSessionManager,
        sessionStartEvent
      })),
      services,
      diagnostics: services.diagnostics
    };
  };

  return createAgentSessionRuntime(createRuntime, { cwd, agentDir, sessionManager });
}

export async function bindHeadlessExtensions(
  session: AgentSession,
  onError: (error: PiExtensionErrorDto) => void
): Promise<void> {
  await session.bindExtensions({
    mode: "json",
    onError(error) {
      onError({
        extensionPath: error.extensionPath,
        event: error.event,
        message: error.error,
        stack: error.stack
      });
    }
  });
}

export function mapPiEvent(event: AgentSessionEvent): JsonValue {
  return toJsonValue(event);
}

export function createRuntimeSnapshot(
  runtimeSlotId: string,
  runtime: AgentSessionRuntime,
  state: RuntimeSlotState
): RuntimeSnapshotDto {
  const session = runtime.session;
  const model = session.model;
  return {
    runtimeSlotId,
    state,
    cwd: runtime.cwd,
    sessionId: session.sessionId,
    sessionFile: session.sessionFile,
    sessionName: session.sessionName,
    isStreaming: session.isStreaming,
    model: model ? { provider: model.provider, id: model.id } : undefined,
    thinkingLevel: session.thinkingLevel,
    messages: session.messages.map(toJsonValue),
    diagnostics: runtime.diagnostics.map(mapDiagnostic)
  };
}

function mapDiagnostic(diagnostic: AgentSessionRuntimeDiagnostic): AgentSessionRuntimeDiagnostic {
  return { type: diagnostic.type, message: diagnostic.message };
}
