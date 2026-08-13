export function SummaryPanelLayout({
  open,
  children,
}: {
  open: boolean;
  children: React.ReactNode;
}) {
  return (
    <div {...({"className":"pointer-events-none absolute top-(--thread-floating-content-top-inset) right-0 bottom-(--thread-floating-content-bottom-inset) z-40"} as any)}>
      <div {...({"className":"relative flex max-h-full"} as any)}>
        <div className={`${open ? "pointer-events-auto" : "pointer-events-none"} pe-4 max-h-full min-h-0 origin-top-right`} style={{ opacity: open ? 1 : 0, transform: open ? "none" : "translateX(100%) scale(0.8)" }}>
          <div className={`flex max-h-full min-h-0 flex-col gap-3 ${open ? "pointer-events-auto" : "pointer-events-none"}`} style={{ width: 300 }}>
            <div {...({"className":"relative flex max-h-full min-h-0 flex-col overflow-hidden rounded-3xl bg-token-dropdown-background pt-2.5 electron:elevation-prominent extension:border extension:border-token-border-default extension:shadow-md"} as any)}>
              <div {...({"className":"flex h-fit max-h-full min-h-0 flex-col gap-3 overflow-y-auto pb-1.5"} as any)}>
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
