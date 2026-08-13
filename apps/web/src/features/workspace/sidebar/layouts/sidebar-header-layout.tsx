export function SidebarHeaderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative z-10 flex shrink-0 flex-col gap-2 px-row-x pb-(--sidebar-scroll-header-spacing)">
      {children}
    </div>
  );
}
