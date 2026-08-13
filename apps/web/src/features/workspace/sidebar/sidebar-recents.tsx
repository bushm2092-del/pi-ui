import { workspaceData } from "../data/workspace-data";
import { SidebarRecentsLayout } from "./layouts";
import { useSidebar } from "../api/sidebar-hooks";
import { SidebarThreadItem } from "./sidebar-thread-item";
import { selectActiveThreadId, selectSelectThread, useWorkspaceUi } from "../model";

export function SidebarRecents() {
  const { data } = useSidebar();
  const activeId = useWorkspaceUi(selectActiveThreadId);
  const select = useWorkspaceUi(selectSelectThread);
  return <SidebarRecentsLayout label={workspaceData.chrome.recents}>{data?.recent.map((item) =>
    <SidebarThreadItem key={item.id} thread={{ kind: "thread", id: item.id, label: item.title, indicator: item.indicator }} active={item.id === activeId} onSelect={select} pinned={item.isPinned} />)}</SidebarRecentsLayout>;
}
