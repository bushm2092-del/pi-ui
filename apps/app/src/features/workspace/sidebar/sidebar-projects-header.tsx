import { workspaceData } from "../data/workspace-data";
import { SidebarProjectsHeaderLayout } from "./layouts";

function ProjectsLabel() {
  return <span className="min-w-0 truncate">{workspaceData.chrome.projects}</span>;
}

export function SidebarProjectsHeader() {
  return <SidebarProjectsHeaderLayout slots={{ "sidebar-projects-label": ProjectsLabel }} />;
}
