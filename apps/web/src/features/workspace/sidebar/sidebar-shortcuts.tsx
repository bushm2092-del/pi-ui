import { workspaceData } from "../data/workspace-data";
import { SidebarShortcutsLayout } from "./layouts";

export function SidebarShortcuts() {
  return <SidebarShortcutsLayout labels={workspaceData.chrome.shortcuts} />;
}
