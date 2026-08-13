import { SidebarHeaderLayout } from "./layouts";
import { SidebarMode } from "./sidebar-mode";
import { SidebarNewConversation } from "./sidebar-new-conversation";

export function SidebarHeader() {
  return (
    <SidebarHeaderLayout>
      <SidebarMode />
      <SidebarNewConversation />
    </SidebarHeaderLayout>
  );
}
