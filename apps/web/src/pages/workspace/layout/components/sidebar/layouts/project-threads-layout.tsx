import type { Project } from "../../../../data/workspace-data";
import { useTranslation } from "react-i18next";

export function ProjectThreadsLayout({
  project,
  children,
}: {
  project: Project;
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
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
              {t("sidebar.emptyProject")}
            </div>
          ) : (
            <div className="isolate flex flex-col [contain:layout]">
              <div
                className="flex flex-col"
                role="list"
                tabIndex={-1}
                aria-label={t("sidebar.scheduledTasksInProject", { project: project.label })}
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
