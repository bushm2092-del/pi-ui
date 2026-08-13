import type { KeyboardEventHandler, MouseEvent } from "react";
import MoreHorizontalIcon from "../../../../assets/svg/more-horizontal.svg?react";
import NewConversationIcon from "../../../../assets/svg/new-conversation.svg?react";
import type { Project } from "../../data/workspace-data";
import { useTranslation } from "react-i18next";

interface ProjectRowLayoutProps {
  project: Project;
  expanded: boolean;
  onClick: () => void;
  onKeyDown: KeyboardEventHandler;
}

const iconButtonClass = "no-drag cursor-interaction items-center gap-1 border whitespace-nowrap select-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 flex rounded-full electron:rounded-md enabled:hover:bg-transparent enabled:active:text-token-foreground/70 data-[state=open]:bg-transparent hover:text-token-foreground border-transparent electron:p-1 electron:[&>svg]:icon-sm flex items-center justify-center p-0.5 sidebar-icon-button sidebar-hover-icon-button-tint";

export function ProjectRowLayout({
  project,
  expanded,
  onClick,
  onKeyDown,
}: ProjectRowLayoutProps) {
  const muted = project.muted === true;
  const { t } = useTranslation();
  const stopPropagation = (event: MouseEvent) => event.stopPropagation();

  return (
    <div
      data-app-action-sidebar-project-collapsed={String(!expanded)}
      data-app-action-sidebar-project-id={project.id}
      data-app-action-sidebar-project-label={project.label}
      data-app-action-sidebar-project-row=""
      className={`sidebar-item group/folder-row group relative flex h-[var(--height-token-row)] cursor-interaction items-center justify-between overflow-x-hidden text-sm text-token-foreground hover:bg-token-list-hover-background focus-visible:outline focus-visible:outline-offset-2${muted ? " text-token-description-foreground opacity-70" : ""}`}
      role="button"
      tabIndex={0}
      aria-label={project.label}
      aria-expanded={expanded}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      <div className="flex min-w-0 flex-1 items-center gap-1 ps-1">
        <span data-sidebar-project-drop-zone="project-icon" data-sidebar-project-kind="local" className="-mx-[3px] flex size-[var(--height-token-row)] shrink-0 items-center justify-center">
          <FolderIcon expanded={expanded} />
        </span>
        <div className={`flex min-w-0 flex-1 items-center gap-2 whitespace-nowrap rounded-md py-1 pe-0 text-left text-base text-token-foreground${muted ? " text-token-description-foreground" : ""}`}>
          <span className="flex min-w-0 flex-1 items-center gap-2 whitespace-nowrap">
            <span className="flex min-w-0 flex-1 items-center gap-0.5">
              <span className="text-fade-truncate pe-1">{project.label}</span>
            </span>
          </span>
        </div>
      </div>
      <div className="flex max-w-[50%] min-w-0 gap-1">
        <div className="w-0 overflow-hidden opacity-0 group-hover/folder-row:w-auto group-hover/folder-row:overflow-visible group-hover/folder-row:opacity-100 focus-within:w-auto focus-within:overflow-visible focus-within:opacity-100">
          <div className="outline-hidden cursor-interaction pe-0.5" data-state="closed">
            <button type="button" className={iconButtonClass} aria-label={t("sidebar.actions.projectMenu", { project: project.label })} aria-haspopup="menu" aria-expanded="false" onClick={stopPropagation}>
              <MoreHorizontalIcon className="icon-xs" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="me-0.5 grid h-6 max-w-48 min-w-6 shrink grid-cols-1 items-center group-hover/folder-row:w-6">
          <span className="col-start-1 row-start-1 inline-flex justify-self-end opacity-0 group-hover/folder-row:opacity-100">
            <button type="button" className={iconButtonClass} disabled={project.canCreateThread === false} aria-label={t("sidebar.actions.startConversationInProject", { project: project.label })} onClick={stopPropagation}>
              <NewConversationIcon className="icon-xs" aria-hidden="true" />
            </button>
          </span>
        </div>
      </div>
      <button type="button" aria-hidden="true" tabIndex={-1} className="sr-only" data-app-action-sidebar-select-project="" />
    </div>
  );
}

function FolderIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="icon-xs shrink-0">
      <path
        fillRule={expanded ? "evenodd" : undefined}
        clipRule={expanded ? "evenodd" : undefined}
        d={expanded
          ? "M4.75488 2.1416C5.30942 2.14164 5.74594 2.23705 6.11816 2.38965C6.48323 2.53934 6.76728 2.73817 7.00391 2.9043L7.02148 2.91699C7.47057 3.23238 7.8162 3.47463 8.55176 3.47461H11.333C12.7194 3.47484 13.8311 4.61217 13.8311 6L13.875 6.38281H13.8594C14.8729 6.38292 15.5982 7.3629 15.3018 8.33203L14.0068 12.5586C13.7703 13.3297 13.0576 13.8563 12.251 13.8564H3.83984C3.4199 13.8564 3.04144 13.7174 2.73828 13.4883L2.67383 13.4346C1.99907 12.9811 1.55577 12.2065 1.55566 11.3311L0.941406 4.66699C0.941406 3.2792 2.05315 2.1419 3.43945 2.1416H4.75488ZM4.7627 7.42969C4.56039 7.42972 4.3807 7.5625 4.32129 7.75586L3.08594 11.7891C2.96123 12.1965 3.18214 12.6072 3.54883 12.7529C3.63476 12.7768 3.74102 12.7958 3.88184 12.8086H12.251C12.5974 12.8085 12.9033 12.5821 13.0049 12.251L14.2998 8.02539C14.3901 7.72947 14.1688 7.42979 13.8594 7.42969H4.7627ZM3.43945 3.19141C2.64724 3.1917 1.99121 3.84481 1.99121 4.66699L2.49316 10.1201L3.32031 7.44922C3.51452 6.81571 4.10008 6.38284 4.7627 6.38281H12.8252L12.7812 6C12.7812 5.22902 12.2045 4.607 11.4795 4.53223L11.333 4.52441H8.55176C8.05756 4.52442 7.64464 4.44062 7.2666 4.2793C6.91453 4.12896 6.6274 3.92345 6.41797 3.77637L6.40039 3.76367C6.16212 3.59639 5.96404 3.46151 5.71973 3.36133C5.54113 3.28812 5.32754 3.2289 5.05176 3.2041L4.75488 3.19141H3.43945Z"
          : "M5.36914 2.1416C5.92368 2.14164 6.3602 2.23705 6.73242 2.38965C7.09745 2.53934 7.38155 2.73818 7.61816 2.9043C8.07599 3.22573 8.42077 3.47464 9.16602 3.47461H11.9473C13.3336 3.47484 14.4453 4.61217 14.4453 6V7.06543C14.4453 7.07196 14.4435 7.07845 14.4434 7.08496V11.3311C14.4432 12.7187 13.3316 13.8562 11.9453 13.8564H4.05371C2.66747 13.8562 1.55583 12.7187 1.55566 11.3311V7.35059C1.55545 7.34451 1.55377 7.33815 1.55371 7.33203C1.55371 7.32563 1.55539 7.31884 1.55566 7.3125V4.66699C1.55566 3.27918 2.66737 2.14185 4.05371 2.1416H5.36914ZM2.60547 7.85645V11.3311C2.60563 12.1519 3.26037 12.8054 4.05371 12.8057H11.9453C12.7387 12.8054 13.3934 12.1519 13.3936 11.3311V7.85645H2.60547ZM4.05371 3.19238C3.26027 3.19264 2.60547 3.84598 2.60547 4.66699V6.80664H13.3955V6C13.3955 5.17898 12.7407 4.52562 11.9473 4.52539H9.16699C8.07975 4.52558 7.50694 4.10863 7.01562 3.76367C6.77766 3.5966 6.57849 3.46159 6.33398 3.36133C6.09656 3.264 5.79646 3.19242 5.36914 3.19238H4.05371Z"}
        fill="currentColor"
      />
    </svg>
  );
}
