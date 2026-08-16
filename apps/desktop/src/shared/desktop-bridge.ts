import type { AgentBackendConnection } from "@pi/shared";
import type { Adapter } from "@pi/adapter";

export const IPC_CHANNELS = {
  appInfo: "app:get-info",
  backendConnection: "backend:get-connection",
  workspaceCwd: "workspace:get-cwd",
  openFile: "file:open",
  saveFile: "file:save",
  openExternal: "shell:open-external"
} as const;

export interface DesktopBridge extends Adapter {
  getBackendConnection(): Promise<AgentBackendConnection>;
  getWorkspaceCwd(): Promise<string>;
}
