import type { AgentBackendConnection } from "@pi/shared";
import type { Adapter } from "@pi/adapter";

declare global {
  interface Window {
    pi?: Adapter & {
      getBackendConnection(): Promise<AgentBackendConnection>;
      getWorkspaceCwd(): Promise<string>;
    };
  }
}

export {};
