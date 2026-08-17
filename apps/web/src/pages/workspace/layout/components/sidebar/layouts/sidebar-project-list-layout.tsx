export function SidebarProjectListLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col" role="list" tabIndex={-1}>
      {children}
    </div>
  );
}
