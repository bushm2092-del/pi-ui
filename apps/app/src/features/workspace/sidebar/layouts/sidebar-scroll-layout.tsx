interface SidebarScrollLayoutProps {
  shortcuts: React.ReactNode;
  pinned: React.ReactNode;
  projects: React.ReactNode;
  recents: React.ReactNode;
}

export function SidebarScrollLayout({
  shortcuts,
  pinned,
  projects,
  recents,
}: SidebarScrollLayoutProps) {
  return (
    <div {...({"data-app-action-sidebar-scroll":"","className":"vertical-scroll-fade-mask relative isolate flex min-h-0 flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto pb-[calc(var(--sidebar-footer-height)+var(--padding-row-x))] [--height-token-row:30px] [--radius-token-row:10px] [contain:layout_paint] pi-sidebar-scroll-fade -mt-[var(--sidebar-scroll-header-spacing,8px)] pt-[var(--sidebar-scroll-content-top-padding,var(--sidebar-scroll-header-spacing,8px))]"} as any)}>
      {shortcuts}
      <div {...({"className":"contents"} as any)}>
        <div {...({"className":""} as any)}>
          {pinned}
        </div>
        {projects}
        <div {...({"className":""} as any)}>
          {recents}
        </div>
      </div>
    </div>
  );
}
