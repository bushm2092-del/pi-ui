import { Children } from "react";
import type { Project } from "../../data/workspace-data";

interface ProjectItemLayoutProps {
  project: Project;
  expanded: boolean;
  hideDivider: boolean;
  children: React.ReactNode;
}

export function ProjectItemLayout({
  project,
  expanded,
  hideDivider,
  children,
}: ProjectItemLayoutProps) {
  const [row, threads] = Children.toArray(children);

  return (
    <div
      className={`after:block after:h-px after:content-[''] last:after:hidden touch-none${hideDivider ? " after:!hidden" : ""}`}
      tabIndex={0}
      aria-disabled="false"
      aria-roledescription="sortable"
      role="listitem"
      style={{ transition: "transform linear" }}
    >
      <div className="overflow-hidden" style={{ height: "auto", opacity: 1, overflow: "visible" }}>
        <div
          data-sidebar-project-kind="local"
          className="group/cwd relative flex flex-col"
          role="listitem"
          aria-label={project.label}
          style={{ transition: "transform linear" }}
        >
          <div className="pointer-events-none absolute top-[var(--height-token-row)] bottom-0 left-0 z-10 w-8" />
          <span data-state="closed" className="contents">
            {row}
          </span>
          {expanded ? threads : null}
        </div>
      </div>
    </div>
  );
}

export function ShowMoreItemLayout({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <div className="flex gap-1 py-1 after:block after:h-px after:content-[''] last:after:hidden" role="listitem">
      <button
        type="button"
        onClick={onClick}
        className="no-drag cursor-interaction items-center gap-1 border whitespace-nowrap select-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 flex rounded-full enabled:hover:bg-transparent enabled:active:text-token-foreground/70 data-[state=open]:bg-transparent hover:text-token-foreground border-transparent px-2 py-0.5 text-sm leading-[18px] !text-base !text-token-input-placeholder-foreground !opacity-75 hover:!text-token-foreground"
      >
        {label}
      </button>
    </div>
  );
}
