import type { KeyboardEvent } from "react";
import type { Project } from "../data/workspace-data";
import { projectRowLayouts } from "./layout-map";

interface SidebarProjectRowProps {
  index: number;
  project: Project;
  expanded: boolean;
  onToggle: () => void;
}

export function SidebarProjectRow({
  index,
  project,
  expanded,
  onToggle,
}: SidebarProjectRowProps) {
  const Layout = projectRowLayouts[index];
  if (!Layout) return null;

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onToggle();
  }

  function ProjectLabel() {
    return <span className="text-fade-truncate pe-1">{project.label}</span>;
  }

  return (
    <Layout
      slots={{ "sidebar-project-label": ProjectLabel }}
      rootProps={{
        "aria-expanded": expanded,
        "aria-label": project.label,
        "data-app-action-sidebar-project-id": project.id,
        "data-app-action-sidebar-project-label": project.label,
        "data-app-action-sidebar-project-collapsed": String(!expanded),
        onClick: onToggle,
        onKeyDown: handleKeyDown,
      }}
    />
  );
}
