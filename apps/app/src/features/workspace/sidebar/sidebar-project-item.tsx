import type { SidebarItem } from "../data/workspace-data";
import { projectItemLayouts, projectRowLayouts, projectThreadsLayouts } from "./layout-map";
import { SidebarProjectRow } from "./sidebar-project-row";
import { SidebarProjectThreads } from "./sidebar-project-threads";

interface SidebarProjectItemProps {
  index: number;
  item: SidebarItem;
  expanded: boolean;
  activeThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  onToggle: () => void;
}

export function SidebarProjectItem({
  index,
  item,
  expanded,
  activeThreadId,
  onSelectThread,
  onToggle,
}: SidebarProjectItemProps) {
  const Layout = projectItemLayouts[index];
  if (!Layout) return null;

  const slots = {
    ...(projectRowLayouts[index]
      ? {
          "sidebar-project-row": function ProjectRowSlot() {
            return item.kind === "project" ? (
              <SidebarProjectRow
                index={index}
                project={item}
                expanded={expanded}
                onToggle={onToggle}
              />
            ) : null;
          },
        }
      : {}),
    ...(projectThreadsLayouts[index]
      ? {
          "sidebar-project-threads": function ProjectThreadsSlot() {
            return item.kind === "project" && expanded ? (
              <SidebarProjectThreads
                index={index}
                project={item}
                activeThreadId={activeThreadId}
                onSelectThread={onSelectThread}
              />
            ) : null;
          },
        }
      : {}),
  };

  return <Layout slots={slots} />;
}
