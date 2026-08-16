import { SidebarPinned } from "./sidebar-pinned";
import { SidebarProjects } from "./sidebar-projects";
import { SidebarRecents } from "./sidebar-recents";
import { SidebarScrollLayout } from "./layouts";
import { SidebarShortcuts } from "./sidebar-shortcuts";

export function SidebarScroll() {
  return (
    <SidebarScrollLayout
      shortcuts={<SidebarShortcuts />}
      pinned={<SidebarPinned />}
      projects={<SidebarProjects />}
      recents={<SidebarRecents />}
    />
  );
}
