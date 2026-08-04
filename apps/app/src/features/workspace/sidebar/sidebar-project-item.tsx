import type { SidebarItem } from "../data/workspace-data";
import { ProjectItemLayout, ShowMoreItemLayout } from "./layouts";
import { SidebarProjectRow } from "./sidebar-project-row";
import { SidebarProjectThreads } from "./sidebar-project-threads";

interface SidebarProjectItemProps {
  item: SidebarItem;
  expanded: boolean;
  hideDivider: boolean;
  activeThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  onToggle: () => void;
}

export function SidebarProjectItem({
  item,
  expanded,
  hideDivider,
  activeThreadId,
  onSelectThread,
  onToggle,
}: SidebarProjectItemProps) {
  if (item.kind === "show-more") {
    return <ShowMoreItemLayout label={item.label} />;
  }

  return (
    <ProjectItemLayout
      project={item}
      expanded={expanded}
      hideDivider={hideDivider}
    >
      <SidebarProjectRow
        project={item}
        expanded={expanded}
        onToggle={onToggle}
      />
      {expanded ? (
        <SidebarProjectThreads
          project={item}
          activeThreadId={activeThreadId}
          onSelectThread={onSelectThread}
        />
      ) : null}
    </ProjectItemLayout>
  );
}
