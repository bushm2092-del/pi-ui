import { MainSurface } from "./main";
import { Sidebar } from "./sidebar";
import { RootLayout } from "./workspace-layout";
import { WorkspaceStateProvider } from "./workspace-state";
import { mockWorkspaceRepository } from "./data/mock";
import { WorkspaceRepositoryProvider } from "./data/workspace-repository-context";

export function WorkspacePage() {
  return (
    <WorkspaceRepositoryProvider value={mockWorkspaceRepository}>
      <WorkspaceStateProvider>
        <RootLayout
          slots={{
            sidebar: Sidebar,
            "main-surface": MainSurface,
          }}
        />
      </WorkspaceStateProvider>
    </WorkspaceRepositoryProvider>
  );
}
