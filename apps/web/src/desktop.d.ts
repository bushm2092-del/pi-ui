import type { AgentBackendConnection } from "@pi/shared";
import type { PlatformAdapter } from "@pi/platform";

declare global {
  interface Window {
    pi?: {
      platform: PlatformAdapter;
      getBackendConnection(): Promise<AgentBackendConnection>;
      getWorkspaceCwd(): Promise<string>;
    };
  }
}

export {};
