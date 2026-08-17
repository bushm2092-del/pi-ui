import type { KeyboardEvent } from "react";
import type { Project } from "../../../data/workspace-data";
import { ProjectRowLayout } from "./layouts";

interface SidebarProjectRowProps {
  project: Project;
  expanded: boolean;
  onToggle: () => void;
}

export function SidebarProjectRow({
  project,
  expanded,
  onToggle,
}: SidebarProjectRowProps) {
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onToggle();
  }

  return (
    <ProjectRowLayout
      project={project}
      expanded={expanded}
      onClick={onToggle}
      onKeyDown={handleKeyDown}
    />
  );
}
