import { workspaceData } from "../data/workspace-data";
import { SidebarPinnedLayout } from "./layouts";
import { useSidebar } from "../api/sidebar-hooks";
import { SidebarThreadItem } from "./sidebar-thread-item";
import { selectActiveThreadId, selectSelectThread, useWorkspaceUi } from "../model";

export function SidebarPinned() {
  const { data } = useSidebar();
  const activeId = useWorkspaceUi(selectActiveThreadId);
  const select = useWorkspaceUi(selectSelectThread);
  return <SidebarPinnedLayout label={workspaceData.chrome.pinned}>{data?.pinned.map((item) =>
    <SidebarThreadItem key={item.id} thread={{ kind: "thread", id: item.id, label: item.title, indicator: item.indicator }} active={item.id === activeId} onSelect={select} pinned />)}</SidebarPinnedLayout>;
}
