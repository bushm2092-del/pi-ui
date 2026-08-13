import type { Project } from "../../data/workspace-data";

export function ProjectThreadsLayout({
  project,
  children,
}: {
  project: Project;
  children: React.ReactNode;
}) {
  return (
    <div
      className="overflow-hidden"
      style={{ height: "auto", opacity: 1, overflow: "visible" }}
    >
      <div className="pt-0.5 pb-2">
        <div
          data-app-action-sidebar-project-list-id={project.id}
          data-app-action-sidebar-project-show-all="false"
        >
          {project.threads.length === 0 ? (
            <div className="text-token-description-foreground opacity-50 px-8 py-1 text-base">
              没有聊天
            </div>
          ) : (
            <div className="isolate flex flex-col [contain:layout]">
              <div
                className="flex flex-col"
                role="list"
                tabIndex={-1}
                aria-label={`${project.label}中的已安排任务`}
              >
                {children}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
