import { SidebarHeaderLayout } from "./layouts";
import { SidebarMode } from "./sidebar-mode";
import { SidebarNewConversation } from "./sidebar-new-conversation";

export function SidebarHeader() {
  return (
    <SidebarHeaderLayout
      slots={{
        "sidebar-mode": SidebarMode,
        "sidebar-new-conversation": SidebarNewConversation,
      }}
    />
  );
}
