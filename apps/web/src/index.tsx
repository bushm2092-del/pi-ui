import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createHashRouter } from "react-router";
import type { Adapter } from "@pi/adapter";
import type { AgentBackendConnection } from "@pi/shared";
import { AgentApiProvider } from "./agent/agent-api-context";
import { installWorkspaceDocument, WorkspacePage } from "./pages/workspace";
import { A2uiStreamTestPage } from "./pages/a2ui-test/a2ui-stream-test-page";
import { AdapterProvider } from "./adapter/context";
import { QueryProvider } from "./query/query-provider";
import { ThemeSync } from "./components/theme/theme-sync";
import { DebugLayout } from "./components/debug-layout";
import { TooltipProvider } from "./components/ui/tooltip";
import { ComponentTestPage } from "./pages/component-test/component-test-page";
import { MessageTestPage } from "./pages/message-test/message-test-page";
import { LanguageSync } from "./i18n/language-sync";
import { AppToaster } from "./components/app-toaster";
import "./i18n";

export interface MountAppOptions {
  adapter: Adapter;
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
        { path: "/test/messages", element: <MessageTestPage /> },
        { path: "/test/components", element: <ComponentTestPage /> },
      ],
    },
  ]);
  const root = createRoot(element);
  root.render(
    <StrictMode>
      <AdapterProvider adapter={options.adapter}>
        <QueryProvider>
          <ThemeSync />
          <LanguageSync />
          <AppToaster />
          <TooltipProvider>
            <AgentApiProvider connection={options.backend}>
              <RouterProvider router={router} />
            </AgentApiProvider>
          </TooltipProvider>
        </QueryProvider>
      </AdapterProvider>
    </StrictMode>
  );
  return () => root.unmount();
}
