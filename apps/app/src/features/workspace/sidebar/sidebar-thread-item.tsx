import type { ThreadItem } from "../data/workspace-data";
import { ThreadItemLayout } from "./layouts";

interface SidebarThreadItemProps {
  thread: ThreadItem;
  active: boolean;
  onSelect: (threadId: string) => void;
}

export function SidebarThreadItem({
  thread,
  active,
  onSelect,
}: SidebarThreadItemProps) {
  return (
    <ThreadItemLayout
      thread={thread}
      active={active}
      onSelect={() => onSelect(thread.id)}
    />
  );
}
