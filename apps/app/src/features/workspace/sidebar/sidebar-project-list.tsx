import { useState } from "react";
import { workspaceData } from "../data/workspace-data";
import { projectItemLayouts } from "./layout-map";
import { SidebarProjectItem } from "./sidebar-project-item";
import { SidebarProjectListLayout } from "./layouts";

export function SidebarProjectList() {
  const items = workspaceData.sidebar.items;
  if (items.length !== projectItemLayouts.length) {
    throw new Error("Sidebar data does not match the available project layouts");
  }

  const [expandedById, setExpandedById] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(
        items.flatMap((item) =>
          item.kind === "project"
            ? [[item.id, item.initialExpanded] as const]
            : [],
        ),
      ),
  );
  const [activeThreadId, setActiveThreadId] = useState<string | null>(
    () =>
      items
        .flatMap((item) => (item.kind === "project" ? item.threads : []))
        .find((thread) => thread.initialActive)?.id ?? null,
  );

  const slots = Object.fromEntries(
    items.map((item, index) => [
      `sidebar-project-item-${index}`,
      function ProjectItemSlot() {
        const expanded = item.kind === "project" ? expandedById[item.id] : false;
        return (
          <SidebarProjectItem
            index={index}
            item={item}
            expanded={expanded ?? false}
            activeThreadId={activeThreadId}
            onSelectThread={setActiveThreadId}
            onToggle={() => {
              if (item.kind !== "project") return;
              setExpandedById((current) => ({
                ...current,
                [item.id]: !current[item.id],
              }));
            }}
          />
        );
      },
    ]),
  );

  return <SidebarProjectListLayout slots={slots} />;
}
