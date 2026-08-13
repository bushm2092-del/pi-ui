import { useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAgentClient } from "../../agent/agent-client-context";
import { MainSurface } from "./main";
import { Sidebar } from "./sidebar";
import { RootLayout } from "./workspace-layout";
import { AgentWorkspaceRepository } from "./data/agent";
import { WorkspaceRepositoryProvider } from "./data/workspace-repository-context";
import { selectSidebarOpen, useWorkspaceUi, WorkspaceUiProvider } from "./model";

function WorkspaceShell() {
  const sidebarOpen = useWorkspaceUi(selectSidebarOpen);

  return <RootLayout sidebar={<Sidebar open={sidebarOpen} />} mainSurface={<MainSurface />} />;
}

export function WorkspacePage({ cwd }: { cwd?: string }) {
  const { client, connectionState, error } = useAgentClient();
  const queryClient = useQueryClient();
  const repository = useMemo(
    () => (client && cwd ? new AgentWorkspaceRepository(client, cwd, queryClient) : undefined),
    [client, cwd, queryClient],
  );

  useEffect(
    () => () => {
      repository?.dispose();
    },
    [repository],
  );

  if (!repository) {
    const message = !client
      ? "未配置 Pi 后端连接。Web 端需要设置 VITE_PI_SOCKET_URL 和 VITE_PI_TOKEN。"
      : "未配置工作区目录。Web 端需要设置 VITE_PI_CWD。";
    return <WorkspaceUnavailable message={error?.message ?? message} />;
  }

  if (connectionState !== "connected") {
    return <WorkspaceUnavailable message={error?.message ?? "正在连接 Pi 后端..."} />;
  }

  return (
    <WorkspaceRepositoryProvider value={repository}>
      <WorkspaceUiProvider>
        <WorkspaceShell />
      </WorkspaceUiProvider>
    </WorkspaceRepositoryProvider>
  );
}

function WorkspaceUnavailable({ message }: { message: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-token-main-surface-primary p-6 text-token-foreground">
      <p className="max-w-lg text-center text-sm text-token-description-foreground">{message}</p>
    </main>
  );
}
