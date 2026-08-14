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
import { ThemeSync } from "./components/theme/theme-sync";
import { DebugLayout } from "./components/debug-layout";
import { TooltipProvider } from "./components/ui/tooltip";
import { ComponentTestPage } from "./features/component-test/component-test-page";
import { LanguageSync } from "./i18n/language-sync";
import { AppToaster } from "./components/app-toaster";
import "./i18n";

export interface MountAppOptions {
  platform: PlatformAdapter;
  backend?: AgentBackendConnection;
  cwd?: string;
}

export function mountApp(element: HTMLElement, options: MountAppOptions) {
  installWorkspaceDocument();
  const router = createHashRouter([
    {
      element: <DebugLayout />,
      children: [
        { path: "/", element: <WorkspacePage cwd={options.cwd} /> },
        { path: "/test/a2ui-stream", element: <A2uiStreamTestPage /> },
        { path: "/test/components", element: <ComponentTestPage /> },
      ],
    },
  ]);
  const root = createRoot(element);
  root.render(
    <StrictMode>
      <PlatformProvider adapter={options.platform}>
        <QueryProvider>
          <ThemeSync />
          <LanguageSync />
          <AppToaster />
          <TooltipProvider>
            <AgentClientProvider connection={options.backend}>
              <RouterProvider router={router} />
            </AgentClientProvider>
          </TooltipProvider>
        </QueryProvider>
      </PlatformProvider>
    </StrictMode>
  );
  return () => root.unmount();
}
