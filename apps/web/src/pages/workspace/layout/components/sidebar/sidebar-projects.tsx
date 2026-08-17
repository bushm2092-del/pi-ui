import { useState } from "react";
import { SidebarProjectList } from "./sidebar-project-list";
import { SidebarProjectsHeader } from "./sidebar-projects-header";
import { SidebarProjectsLayout } from "./layouts";

export function SidebarProjects() {
  const [expanded, setExpanded] = useState(true);

  return (
    <SidebarProjectsLayout
      expanded={expanded}
      header={
        <SidebarProjectsHeader
          expanded={expanded}
          onToggle={() => setExpanded((current) => !current)}
        />
      }
      projectList={<SidebarProjectList />}
    />
  );
}
