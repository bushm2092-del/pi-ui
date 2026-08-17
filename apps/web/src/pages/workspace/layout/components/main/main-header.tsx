import { MainHeaderContext } from "./main-header-context";
import { MainHeaderLayout } from "./layouts";
import { selectSidebarOpen, selectSidebarWidth, selectToggleSidebar, useWorkspaceUi } from "../../../model";

export function MainHeader() {
  const sidebarOpen = useWorkspaceUi(selectSidebarOpen);
  const toggleSidebar = useWorkspaceUi(selectToggleSidebar);
  const sidebarWidth = useWorkspaceUi(selectSidebarWidth);

  return (
    <MainHeaderLayout sidebarOpen={sidebarOpen} sidebarWidth={sidebarWidth} onToggleSidebar={toggleSidebar}>
      <MainHeaderContext />
    </MainHeaderLayout>
  );
}
