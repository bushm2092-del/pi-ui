import { workspaceData } from "../data/workspace-data";
import { SidebarNewConversationLayout } from "./layouts";

function NewConversationLabel() {
  return <span className="text-fade-truncate">{workspaceData.chrome.newConversation}</span>;
}

export function SidebarNewConversation() {
  return (
    <SidebarNewConversationLayout
      slots={{ "sidebar-new-conversation-label": NewConversationLabel }}
    />
  );
}
