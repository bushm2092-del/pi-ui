import { SidebarFooter } from "./sidebar-footer";
import { SidebarHeader } from "./sidebar-header";
import { SidebarLayout } from "./layouts";
import { SidebarScroll } from "./sidebar-scroll";
import { selectSetSidebarWidth, selectSidebarWidth, useWorkspaceUi } from "../../../model";

export function Sidebar({ open = true }: { open?: boolean }) {
  const width = useWorkspaceUi(selectSidebarWidth);
  const setWidth = useWorkspaceUi(selectSetSidebarWidth);

  return (
    <SidebarLayout
      open={open}
      width={width}
      onWidthChange={setWidth}
      header={<SidebarHeader />}
      scroll={<SidebarScroll />}
      footer={<SidebarFooter />}
    />
  );
}
