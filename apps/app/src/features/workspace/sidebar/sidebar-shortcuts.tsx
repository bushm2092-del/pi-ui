import { workspaceData } from "../data/workspace-data";
import { SidebarShortcutsLayout } from "./layouts";

const shortcutSlots = Object.fromEntries(
  workspaceData.chrome.shortcuts.map((label, index) => [
    `sidebar-shortcut-label-${index}`,
    function ShortcutLabel() {
      return index < 2 ? (
        <span className="text-fade-truncate">{label}</span>
      ) : (
        <span className="text-fade-truncate">
          <span className="inline-flex items-center gap-1">{label}</span>
        </span>
      );
    },
  ]),
);

export function SidebarShortcuts() {
  return <SidebarShortcutsLayout slots={shortcutSlots} />;
}
