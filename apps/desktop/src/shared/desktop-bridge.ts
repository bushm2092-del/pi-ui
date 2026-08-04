import type { AgentBackendConnection } from "@pi/agent-client";
import type { PlatformAdapter } from "@pi/platform";

export const IPC_CHANNELS = {
  appInfo: "app:get-info",
  backendConnection: "backend:get-connection",
  openFile: "file:open",
  saveFile: "file:save",
  openExternal: "shell:open-external"
} as const;

export interface DesktopBridge {
  platform: PlatformAdapter;
  getBackendConnection(): Promise<AgentBackendConnection>;
}
