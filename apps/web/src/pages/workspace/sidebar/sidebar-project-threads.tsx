import type { Project } from "../data/workspace-data";
import { ProjectThreadsLayout } from "./layouts";
import { SidebarThreadItem } from "./sidebar-thread-item";

interface SidebarProjectThreadsProps {
  project: Project;
  activeThreadId: string | null;
  onSelectThread: (threadId: string) => void;
}

export function SidebarProjectThreads({
  project,
  activeThreadId,
  onSelectThread,
}: SidebarProjectThreadsProps) {
  return (
    <ProjectThreadsLayout project={project}>
      {project.threads.map((thread) => (
        <SidebarThreadItem
          key={thread.id}
          thread={thread}
          active={thread.id === activeThreadId}
          onSelect={onSelectThread}
        />
      ))}
    </ProjectThreadsLayout>
  );
}
