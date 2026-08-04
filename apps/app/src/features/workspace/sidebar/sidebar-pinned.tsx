import { workspaceData } from "../data/workspace-data";
import { SidebarPinnedLayout } from "./layouts";

function PinnedLabel() {
  return <span className="min-w-0 truncate">{workspaceData.chrome.pinned}</span>;
}

export function SidebarPinned() {
  return <SidebarPinnedLayout slots={{ "sidebar-pinned-label": PinnedLabel }} />;
}
