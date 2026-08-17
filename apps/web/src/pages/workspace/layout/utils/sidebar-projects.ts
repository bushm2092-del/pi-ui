import type { SidebarProjectDto } from "@pi/shared";
import type { Project } from "../../data/workspace-data";

export function toSidebarProjects(projects: SidebarProjectDto[], showMoreLabel: string): Project[] {
  return projects.map((project) => ({
    kind: "project",
    id: project.id,
    label: project.name,
    initialExpanded: true,
    threads: [
      ...project.conversations.map((conversation) => ({
        kind: "thread" as const,
        id: conversation.id,
        label: conversation.title,
        indicator: conversation.indicator,
      })),
      ...(project.hasMore
        ? [{ kind: "show-more" as const, id: `${project.id}-show-more`, label: showMoreLabel }]
        : []),
    ],
  }));
}
