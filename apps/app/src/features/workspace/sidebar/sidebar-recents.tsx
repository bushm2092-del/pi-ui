import { workspaceData } from "../data/workspace-data";
import { SidebarRecentsLayout } from "./layouts";

export function SidebarRecents() {
  return <SidebarRecentsLayout label={workspaceData.chrome.recents} />;
}
