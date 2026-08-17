import { useExpandProjectConversations, useSidebar } from "../../../hooks";
import {
  selectActiveThreadId,
  selectExpandedProjectIds,
  selectSelectThread,
  selectToggleProject,
  useWorkspaceUi,
} from "../../../model";
import { SidebarProjectItem } from "./sidebar-project-item";
import { SidebarEmptyState, SidebarProjectListLayout } from "./layouts";
import { useTranslation } from "react-i18next";
import { toSidebarProjects } from "../../utils/sidebar-projects";

export function SidebarProjectList() {
  const { t } = useTranslation();
  const { data } = useSidebar();
  const expand = useExpandProjectConversations();
  const items = toSidebarProjects(data?.projects ?? [], t("sidebar.showMore"));
  const expandedProjectIds = useWorkspaceUi(selectExpandedProjectIds);
  const activeThreadId = useWorkspaceUi(selectActiveThreadId);
  const selectThread = useWorkspaceUi(selectSelectThread);
  const toggleProject = useWorkspaceUi(selectToggleProject);

  return (
    <SidebarProjectListLayout>
      {data?.projects.length === 0 ? (
        <SidebarEmptyState label={t("sidebar.emptyProjects")} />
      ) : null}
      {items.map((item, index) => {
        const expanded =
          item.kind === "project" && expandedProjectIds.includes(item.id);
        return (
          <SidebarProjectItem
            key={item.kind === "project" ? item.id : `show-more-${item.label}`}
            item={item}
            expanded={expanded}
            hideDivider={index === items.length - 1}
            activeThreadId={activeThreadId}
            onSelectThread={selectThread}
            onToggle={() => {
              if (item.kind === "project") toggleProject(item.id);
            }}
            onShowMore={() => expand.mutate(item.id)}
          />
        );
      })}
    </SidebarProjectListLayout>
  );
}
