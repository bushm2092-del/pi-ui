import { SidebarProjectList } from "./sidebar-project-list";
import { SidebarProjectsHeader } from "./sidebar-projects-header";
import { SidebarProjectsLayout } from "./layouts";

export function SidebarProjects() {
  return (
    <SidebarProjectsLayout
      header={<SidebarProjectsHeader />}
      projectList={<SidebarProjectList />}
    />
  );
}
