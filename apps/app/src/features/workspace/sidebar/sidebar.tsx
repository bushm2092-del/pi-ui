import { SidebarFooter } from "./sidebar-footer";
import { SidebarHeader } from "./sidebar-header";
import { SidebarLayout } from "./layouts";
import { SidebarScroll } from "./sidebar-scroll";

export function Sidebar() {
  return (
    <SidebarLayout
      slots={{
        "sidebar-header": SidebarHeader,
        "sidebar-scroll": SidebarScroll,
        "sidebar-footer": SidebarFooter,
      }}
    />
  );
}
