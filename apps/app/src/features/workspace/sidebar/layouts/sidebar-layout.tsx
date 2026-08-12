import { useEffect, useState, type PointerEvent as ReactPointerEvent } from "react";

interface SidebarLayoutProps {
  open: boolean;
  width: number;
  onWidthChange: (width: number) => void;
  header: React.ReactNode;
  scroll: React.ReactNode;
  footer: React.ReactNode;
}

const SIDEBAR_MIN_WIDTH = 240;
const SIDEBAR_MAX_WIDTH = 520;
const MAIN_MIN_WIDTH = 320;

function clampSidebarWidth(width: number) {
  return Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, Math.min(width, window.innerWidth - MAIN_MIN_WIDTH)));
}

export function SidebarLayout({ open, width, onWidthChange, header, scroll, footer }: SidebarLayoutProps) {
  const [resizing, setResizing] = useState(false);

  useEffect(() => {
    if (!resizing) return;
    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    return () => {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
    };
  }, [resizing]);

  const startResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setResizing(true);
  };

  const resize = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (resizing) onWidthChange(clampSidebarWidth(event.clientX));
  };

  const stopResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setResizing(false);
  };

  const resizeWithKeyboard = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const direction = event.key === "ArrowLeft" ? -1 : 1;
    onWidthChange(clampSidebarWidth(width + direction * (event.shiftKey ? 32 : 8)));
  };

  return (
    <aside
      className="app-shell-left-panel pi-sidebar-panel relative flex overflow-visible browser:bg-token-main-surface-primary"
      data-open={String(open)}
      data-resizing={String(resizing)}
      aria-hidden={!open}
      style={{
        paddingTop: "var(--height-toolbar)",
        width: open ? width : 0,
        flexBasis: open ? width : 0,
      }}
    >
      <div className="pi-sidebar-panel-content max-w-full overflow-hidden" style={{ minWidth: width, width }}>
        <div {...({ className: "select-none box-border flex h-full w-full isolate flex-col [contain:layout_paint]" } as any)}>
          <div
            {...({
              className:
                "relative flex min-h-0 flex-1 flex-col overflow-hidden [--height-token-mode-switch:32px] [--height-token-nav-row:30px] [--padding-row-cell-x:8px] [--padding-row-x:8px] [--radius-token-row:10px]",
              style: {
                "--sidebar-footer-height": "46px",
                "--sidebar-scroll-content-top-padding": "1px",
                "--sidebar-scroll-header-fade-distance": "1px",
                "--sidebar-scroll-header-fade-start": "0px",
                "--sidebar-scroll-header-spacing": "1px",
              },
            } as any)}
          >
            <nav {...({ className: "pi-sidebar-navigation", role: "navigation", "aria-label": "已安排任务文件夹" } as any)}>
              {header}
              {scroll}
              <div {...({ id: "DndDescribedBy-3", style: { display: "none" } } as any)}>
                {
                  "\n    To pick up a draggable item, press the space bar.\n    While dragging, use the arrow keys to move the item.\n    Press space again to drop the item in its new position, or press escape to cancel.\n  "
                }
              </div>
              <div
                {...({
                  id: "DndLiveRegion-3",
                  role: "status",
                  "aria-live": "assertive",
                  "aria-atomic": "true",
                  style: {
                    position: "fixed",
                    top: "0px",
                    left: "0px",
                    width: "1px",
                    height: "1px",
                    margin: "-1px",
                    border: "0px",
                    padding: "0px",
                    overflow: "hidden",
                    clip: "rect(0px, 0px, 0px, 0px)",
                    clipPath: "inset(100%)",
                    whiteSpace: "nowrap",
                  },
                } as any)}
              />
            </nav>
            {footer}
          </div>
        </div>
      </div>
      <div
        role="separator"
        aria-label="调整边栏宽度"
        aria-orientation="vertical"
        aria-valuemin={SIDEBAR_MIN_WIDTH}
        aria-valuemax={SIDEBAR_MAX_WIDTH}
        aria-valuenow={Math.round(width)}
        tabIndex={open ? 0 : -1}
        className="group absolute z-20 -top-toolbar right-0 bottom-0 flex w-4 translate-x-2 touch-none cursor-col-resize select-none focus:outline-none active:cursor-col-resize"
        onPointerDown={startResize}
        onPointerMove={resize}
        onPointerUp={stopResize}
        onPointerCancel={stopResize}
        onKeyDown={resizeWithKeyboard}
      >
        <div
          {...({
            className:
              "sidebar-resize-handle-line pointer-events-none m-auto opacity-0 h-full w-px bg-gradient-to-b from-transparent via-token-foreground/25 to-transparent group-hover:opacity-100 group-active:opacity-100 group-focus-visible:opacity-100",
          } as any)}
        />
      </div>
    </aside>
  );
}
