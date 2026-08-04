import { workspaceData } from "../data/workspace-data";
import {
  selectActiveThreadId,
  selectExpandedProjectIds,
  selectSelectThread,
  selectToggleProject,
  useWorkspaceUi,
} from "../model";
import { SidebarProjectItem } from "./sidebar-project-item";
import { SidebarProjectListLayout } from "./layouts";

export function SidebarProjectList() {
  const items = workspaceData.sidebar.items;
  const expandedProjectIds = useWorkspaceUi(selectExpandedProjectIds);
  const activeThreadId = useWorkspaceUi(selectActiveThreadId);
  const selectThread = useWorkspaceUi(selectSelectThread);
  const toggleProject = useWorkspaceUi(selectToggleProject);

  return (
    <SidebarProjectListLayout>
      {items.map((item, index) => {
        const expanded =
          item.kind === "project" && expandedProjectIds.includes(item.id);
        return (
          <SidebarProjectItem
            key={item.kind === "project" ? item.id : `show-more-${item.label}`}
            item={item}
            expanded={expanded}
            hideDivider={items[index + 1]?.kind === "show-more"}
            activeThreadId={activeThreadId}
            onSelectThread={selectThread}
            onToggle={() => {
              if (item.kind === "project") toggleProject(item.id);
            }}
          />
        );
      })}
    </SidebarProjectListLayout>
  );
}
