import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createHashRouter } from "react-router";
import type { PlatformAdapter } from "@pi/platform";
import type { AgentBackendConnection } from "@pi/shared";
import { AgentClientProvider } from "./agent/agent-client-context";
import { installWorkspaceDocument, WorkspacePage } from "./features/workspace";
import { A2uiStreamTestPage } from "./features/a2ui-test/a2ui-stream-test-page";
import { PlatformProvider } from "./platform/context";
import { QueryProvider } from "./query/query-provider";

export interface MountAppOptions {
  platform: PlatformAdapter;
  backend?: AgentBackendConnection;
  cwd?: string;
}

export function mountApp(element: HTMLElement, options: MountAppOptions) {
  installWorkspaceDocument();
  const router = createHashRouter([
    { path: "/", element: <WorkspacePage cwd={options.cwd} /> },
    { path: "/test/a2ui-stream", element: <A2uiStreamTestPage /> },
  ]);
  const root = createRoot(element);
  root.render(
    <StrictMode>
      <PlatformProvider adapter={options.platform}>
        <QueryProvider>
          <AgentClientProvider connection={options.backend}>
            <RouterProvider router={router} />
          </AgentClientProvider>
        </QueryProvider>
      </PlatformProvider>
    </StrictMode>
  );
  return () => root.unmount();
}
