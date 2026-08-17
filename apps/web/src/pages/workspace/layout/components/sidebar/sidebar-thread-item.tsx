import type { ThreadItem } from "../../../data/workspace-data";
import { ThreadItemLayout } from "./layouts";
import { useArchiveConversation, usePinConversation } from "../../../hooks";

interface SidebarThreadItemProps {
  thread: ThreadItem;
  active: boolean;
  onSelect: (threadId: string) => void;
  pinned?: boolean;
}

export function SidebarThreadItem({
  thread,
  active,
  onSelect,
  pinned = false,
}: SidebarThreadItemProps) {
  const pin = usePinConversation();
  const archive = useArchiveConversation();
  return (
    <ThreadItemLayout
      thread={thread}
      active={active}
      onSelect={() => onSelect(thread.id)}
      pinned={pinned}
      onPin={() => pin.mutate({ id: thread.id, pinned: !pinned })}
      onArchive={() => archive.mutate(thread.id)}
    />
  );
}
