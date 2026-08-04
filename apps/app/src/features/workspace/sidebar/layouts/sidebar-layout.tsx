interface SidebarLayoutProps {
  header: React.ReactNode;
  scroll: React.ReactNode;
  footer: React.ReactNode;
}

export function SidebarLayout({ header, scroll, footer }: SidebarLayoutProps) {
  return (
    <aside {...({"className":"app-shell-left-panel pointer-events-auto relative flex overflow-visible browser:bg-token-main-surface-primary","style":{"paddingTop":"var(--height-toolbar)","width":"240px"}} as any)}>
      <div {...({"className":"max-w-full overflow-hidden","style":{"minWidth":"240px","width":"240px","opacity":"1"}} as any)}>
        <div {...({"className":"select-none box-border flex h-full w-full isolate flex-col [contain:layout_paint]"} as any)}>
          <div {...({"className":"relative flex min-h-0 flex-1 flex-col overflow-hidden [--height-token-mode-switch:32px] [--height-token-nav-row:30px] [--padding-row-cell-x:8px] [--padding-row-x:8px] [--radius-token-row:10px]","style":{"--sidebar-footer-height":"46px","--sidebar-scroll-content-top-padding":"1px","--sidebar-scroll-header-fade-distance":"1px","--sidebar-scroll-header-fade-start":"0px","--sidebar-scroll-header-spacing":"1px"}} as any)}>
            <nav {...({"className":"pi-sidebar-navigation","role":"navigation","aria-label":"已安排任务文件夹"} as any)}>
              {header}
              {scroll}
              <div {...({"id":"DndDescribedBy-3","style":{"display":"none"}} as any)}>
                {"\n    To pick up a draggable item, press the space bar.\n    While dragging, use the arrow keys to move the item.\n    Press space again to drop the item in its new position, or press escape to cancel.\n  "}
              </div>
              <div {...({"id":"DndLiveRegion-3","role":"status","aria-live":"assertive","aria-atomic":"true","style":{"position":"fixed","top":"0px","left":"0px","width":"1px","height":"1px","margin":"-1px","border":"0px","padding":"0px","overflow":"hidden","clip":"rect(0px, 0px, 0px, 0px)","clipPath":"inset(100%)","whiteSpace":"nowrap"}} as any)} />
            </nav>
            {footer}
          </div>
        </div>
      </div>
      <div {...({"role":"separator","aria-orientation":"vertical","className":"group absolute flex touch-none select-none focus:outline-none z-20 -top-toolbar right-0 bottom-0 w-4 translate-x-2 cursor-col-resize active:cursor-col-resize"} as any)}>
        <div {...({"className":"sidebar-resize-handle-line pointer-events-none m-auto opacity-0 h-full w-px bg-gradient-to-b from-transparent via-token-foreground/25 to-transparent group-hover:opacity-100 group-active:opacity-100 group-focus-visible:opacity-100"} as any)} />
      </div>
    </aside>
  );
}
