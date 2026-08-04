import type { Project } from "../data/workspace-data";
import { projectThreadsLayouts } from "./layout-map";
import { SidebarThreadItem } from "./sidebar-thread-item";

interface SidebarProjectThreadsProps {
  index: number;
  project: Project;
  activeThreadId: string | null;
  onSelectThread: (threadId: string) => void;
}

export function SidebarProjectThreads({
  index,
  project,
  activeThreadId,
  onSelectThread,
}: SidebarProjectThreadsProps) {
  const Layout = projectThreadsLayouts[index];
  if (!Layout) return null;

  const slots = Object.fromEntries(
    project.threads.map((thread, threadIndex) => [
      `sidebar-thread-item-${threadIndex}`,
      function ThreadItemSlot() {
        return (
          <SidebarThreadItem
            projectIndex={index}
            threadIndex={threadIndex}
            thread={thread}
            active={thread.id === activeThreadId}
            onSelect={onSelectThread}
          />
        );
      },
    ]),
  );

  return <Layout slots={slots} />;
}
