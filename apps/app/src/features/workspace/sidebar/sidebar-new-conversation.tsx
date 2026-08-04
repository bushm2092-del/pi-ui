import { workspaceData } from "../data/workspace-data";
import { SidebarNewConversationLayout } from "./layouts";

export function SidebarNewConversation() {
  return (
    <SidebarNewConversationLayout
      label={workspaceData.chrome.newConversation}
    />
  );
}
