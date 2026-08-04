import { workspaceData } from "../data/workspace-data";
import { SidebarRecentsLayout } from "./layouts";

function RecentsLabel() {
  return <span className="min-w-0 truncate">{workspaceData.chrome.recents}</span>;
}

export function SidebarRecents() {
  return <SidebarRecentsLayout slots={{ "sidebar-recents-label": RecentsLabel }} />;
}
