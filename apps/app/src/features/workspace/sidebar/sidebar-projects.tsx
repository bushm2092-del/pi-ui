import { SidebarProjectList } from "./sidebar-project-list";
import { SidebarProjectsHeader } from "./sidebar-projects-header";
import { SidebarProjectsLayout } from "./layouts";

export function SidebarProjects() {
  return (
    <SidebarProjectsLayout
      slots={{
        "sidebar-projects-header": SidebarProjectsHeader,
        "sidebar-project-list": SidebarProjectList,
      }}
    />
  );
}
