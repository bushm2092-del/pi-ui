import { workspaceData } from "../data/workspace-data";
import { SidebarProjectsHeaderLayout } from "./layouts";

export function SidebarProjectsHeader() {
  return <SidebarProjectsHeaderLayout label={workspaceData.chrome.projects} />;
}
