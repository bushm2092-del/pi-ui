import { SidebarPinned } from "./sidebar-pinned";
import { SidebarProjects } from "./sidebar-projects";
import { SidebarRecents } from "./sidebar-recents";
import { SidebarScrollLayout } from "./layouts";
import { SidebarShortcuts } from "./sidebar-shortcuts";

export function SidebarScroll() {
  return (
    <SidebarScrollLayout
      slots={{
        "sidebar-shortcuts": SidebarShortcuts,
        "sidebar-projects": SidebarProjects,
        "sidebar-pinned": SidebarPinned,
        "sidebar-recents": SidebarRecents,
      }}
    />
  );
}
