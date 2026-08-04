import { workspaceData } from "../data/workspace-data";
import { SidebarFooterLayout } from "./layouts";

function AccountLabel() {
  return <span className="min-w-0 flex-1 truncate">{workspaceData.chrome.account}</span>;
}

export function SidebarFooter() {
  return <SidebarFooterLayout slots={{ "sidebar-account-label": AccountLabel }} />;
}
