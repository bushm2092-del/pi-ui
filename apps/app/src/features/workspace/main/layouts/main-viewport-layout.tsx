export function MainViewportLayout({ children }: { children: React.ReactNode }) {
  return (
    <div {...({"className":"pi-workspace-main-viewport","data-app-shell-main-content-layout":"thread-edge-scroll","data-app-shell-right-panel-full-width":"false"} as any)}>
      {children}
    </div>
  );
}
