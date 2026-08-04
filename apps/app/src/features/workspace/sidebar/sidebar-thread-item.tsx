import type { ThreadItem } from "../data/workspace-data";
import { getThreadItemLayout } from "./layout-map";

interface SidebarThreadItemProps {
  projectIndex: number;
  threadIndex: number;
  thread: ThreadItem;
  active: boolean;
  onSelect: (threadId: string) => void;
}

export function SidebarThreadItem({
  projectIndex,
  threadIndex,
  thread,
  active,
  onSelect,
}: SidebarThreadItemProps) {
  const Layout = getThreadItemLayout(projectIndex, threadIndex, active);
  if (!Layout) return null;

  function ThreadLabel() {
    return <span>{thread.label}</span>;
  }

  function ShowMoreLabel() {
    return <>{thread.label}</>;
  }

  return (
    <Layout
      slots={{
        "sidebar-thread-label": ThreadLabel,
        "sidebar-show-more-label": ShowMoreLabel,
      }}
      rootProps={
        thread.kind === "thread"
          ? { onClick: () => onSelect(thread.id) }
          : undefined
      }
    />
  );
}
