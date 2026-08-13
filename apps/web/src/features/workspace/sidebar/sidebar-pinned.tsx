import { useTranslation } from "react-i18next";
import { SidebarPinnedLayout } from "./layouts";
import { useSidebar } from "../api/sidebar-hooks";
import { SidebarThreadItem } from "./sidebar-thread-item";
import { selectActiveThreadId, selectSelectThread, useWorkspaceUi } from "../model";

export function SidebarPinned() {
  const { t } = useTranslation();
  const { data } = useSidebar();
  const activeId = useWorkspaceUi(selectActiveThreadId);
  const select = useWorkspaceUi(selectSelectThread);
  return <SidebarPinnedLayout label={t("sidebar.sections.pinned")}>{data?.pinned.map((item) =>
    <SidebarThreadItem key={item.id} thread={{ kind: "thread", id: item.id, label: item.title, indicator: item.indicator }} active={item.id === activeId} onSelect={select} pinned />)}</SidebarPinnedLayout>;
}
