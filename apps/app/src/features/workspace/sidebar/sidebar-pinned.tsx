import { workspaceData } from "../data/workspace-data";
import { SidebarPinnedLayout } from "./layouts";

export function SidebarPinned() {
  return <SidebarPinnedLayout label={workspaceData.chrome.pinned} />;
}
