import { workspaceData } from "../data/workspace-data";
import { SidebarFooterLayout } from "./layouts";

export function SidebarFooter() {
  return <SidebarFooterLayout accountLabel={workspaceData.chrome.account} />;
}
