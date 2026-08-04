import { MainSurface } from "./main";
import { Sidebar } from "./sidebar";
import { RootLayout } from "./workspace-layout";
import { mockWorkspaceRepository } from "./data/mock";
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

export function WorkspacePage() {
  return (
    <WorkspaceRepositoryProvider value={mockWorkspaceRepository}>
      <WorkspaceUiProvider>
        <WorkspaceShell />
      </WorkspaceUiProvider>
    </WorkspaceRepositoryProvider>
  );
}
