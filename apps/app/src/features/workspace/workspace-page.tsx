import { useEffect, useMemo } from "react";
import { useAgentClient } from "../../agent/agent-client-context";
import { MainSurface } from "./main";
import { Sidebar } from "./sidebar";
import { RootLayout } from "./workspace-layout";
import { mockWorkspaceRepository } from "./data/mock";
import { AgentWorkspaceRepository } from "./data/agent";
import { WorkspaceRepositoryProvider } from "./data/workspace-repository-context";
import {
  selectSidebarOpen,
  useWorkspaceUi,
  WorkspaceUiProvider,
} from "./model";

function WorkspaceShell() {
  const sidebarOpen = useWorkspaceUi(selectSidebarOpen);

  return (
    <RootLayout
      sidebar={sidebarOpen ? <Sidebar /> : null}
      mainSurface={<MainSurface />}
    />
  );
}

export function WorkspacePage({ cwd }: { cwd?: string }) {
  const { client } = useAgentClient();
  const repository = useMemo(
    () => client && cwd ? new AgentWorkspaceRepository(client, cwd) : mockWorkspaceRepository,
    [client, cwd],
  );

  useEffect(() => () => {
    if (repository instanceof AgentWorkspaceRepository) repository.dispose();
  }, [repository]);

  return (
    <WorkspaceRepositoryProvider value={repository}>
      <WorkspaceUiProvider>
        <WorkspaceShell />
      </WorkspaceUiProvider>
    </WorkspaceRepositoryProvider>
  );
}
