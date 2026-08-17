import { MainSurface } from "./components/main";
import { selectSidebarOpen, useWorkspaceUi } from "../model";
import { Sidebar } from "./components/sidebar";
import { RootLayout } from "./components/workspace-layout";

export function WorkspaceLayout() {
  const sidebarOpen = useWorkspaceUi(selectSidebarOpen);

  return <RootLayout sidebar={<Sidebar open={sidebarOpen} />} mainSurface={<MainSurface />} />;
}

export { RootLayout, Sidebar };
