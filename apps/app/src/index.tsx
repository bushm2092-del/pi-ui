import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import type { PlatformAdapter } from "@pi/platform";
import type { AgentBackendConnection } from "@pi/agent-client";
import { AgentClientProvider } from "./agent/agent-client-context";
import { installWorkspaceDocument, WorkspacePage } from "./features/workspace";
import { PlatformProvider } from "./platform/context";

export interface MountAppOptions {
  platform: PlatformAdapter;
  backend?: AgentBackendConnection;
}

export function mountApp(element: HTMLElement, options: MountAppOptions) {
  installWorkspaceDocument();
  const root = createRoot(element);
  root.render(
    <StrictMode>
      <PlatformProvider adapter={options.platform}>
        <AgentClientProvider connection={options.backend}>
          <WorkspacePage />
        </AgentClientProvider>
      </PlatformProvider>
    </StrictMode>
  );
  return () => root.unmount();
}
