import { MainHeaderContext } from "./main-header-context";
import { MainHeaderLayout } from "./layouts";
import {
  selectSidebarOpen,
  selectToggleSidebar,
  useWorkspaceUi,
} from "../model";

export function MainHeader() {
  const sidebarOpen = useWorkspaceUi(selectSidebarOpen);
  const toggleSidebar = useWorkspaceUi(selectToggleSidebar);

  return (
    <MainHeaderLayout sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar}>
      <MainHeaderContext />
    </MainHeaderLayout>
  );
}
