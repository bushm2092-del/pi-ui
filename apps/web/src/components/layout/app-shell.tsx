import { Outlet } from "react-router";
import { PanelLeft, PanelRight } from "lucide-react";
import { IconButton, Surface, Tooltip } from "@pi/ui";
import { Sidebar } from "../../features/workspace/sidebar";
import { useAppStore } from "../../stores/app-store";

export function AppShell() {
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  const summaryPanelOpen = useAppStore((state) => state.summaryPanelOpen);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);
  const toggleSummaryPanel = useAppStore((state) => state.toggleSummaryPanel);

  return (
    <div className="relative grid h-dvh min-h-0 grid-cols-[auto_minmax(0,1fr)_auto] overflow-hidden bg-surface-app">
      {sidebarOpen ? (
        <div className="z-30 min-h-0 max-md:absolute max-md:inset-y-0 max-md:left-0 max-md:shadow-lg">
          <Sidebar />
        </div>
      ) : null}

      <Surface className="relative flex min-h-0 min-w-0 flex-col overflow-hidden" variant="main">
        <header className="app-drag-region flex h-(--height-toolbar) shrink-0 items-center gap-1 border-b border-border-subtle px-2">
          {!sidebarOpen ? (
            <Tooltip content="显示边栏">
              <IconButton aria-label="显示边栏" onClick={toggleSidebar}><PanelLeft /></IconButton>
            </Tooltip>
          ) : null}
          <div className="min-w-0 flex-1 px-2">
            <p className="truncate text-sm font-medium">Pi 工作台</p>
          </div>
          <Tooltip content={summaryPanelOpen ? "隐藏摘要" : "显示摘要"}>
            <IconButton aria-label={summaryPanelOpen ? "隐藏摘要" : "显示摘要"} onClick={toggleSummaryPanel}>
              <PanelRight />
            </IconButton>
          </Tooltip>
        </header>
        <main className="min-h-0 min-w-0 flex-1 overflow-auto bg-surface-main">
          <Outlet />
        </main>
      </Surface>

      {summaryPanelOpen ? (
        <aside aria-label="摘要面板" className="hidden h-full w-(--width-summary-panel) border-l border-border-subtle bg-surface-sidebar lg:block">
          <div className="flex h-(--height-toolbar) items-center border-b border-border-subtle px-4 text-sm font-medium">输出</div>
        </aside>
      ) : null}

      {sidebarOpen ? (
        <button
          type="button"
          aria-label="关闭边栏遮罩"
          className="absolute inset-0 z-20 hidden bg-black/20 max-md:block"
          onClick={toggleSidebar}
        />
      ) : null}
    </div>
  );
}
