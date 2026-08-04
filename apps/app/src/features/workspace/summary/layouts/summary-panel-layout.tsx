import { LayoutSlot, type LayoutProps } from "../../layout";

export function SummaryPanelLayout({ slots = {}, rootProps = {} }: LayoutProps = {}) {
  return (
    <div {...({"className":"pointer-events-none absolute top-(--thread-floating-content-top-inset) right-0 bottom-(--thread-floating-content-bottom-inset) z-40"} as any)} {...rootProps}>
      <div {...({"className":"relative flex max-h-full"} as any)}>
        <div {...({"className":"pointer-events-none pe-4 max-h-full min-h-0 origin-top-right","style":{"opacity":"0","transform":"translateX(100%) scale(0.8)"}} as any)}>
          <div {...({"className":"flex max-h-full min-h-0 flex-col gap-3 pointer-events-none","style":{"width":"300px"}} as any)}>
            <div {...({"className":"relative flex max-h-full min-h-0 flex-col overflow-hidden rounded-3xl bg-token-dropdown-background pt-2.5 electron:elevation-prominent extension:border extension:border-token-border-default extension:shadow-md"} as any)}>
              <div {...({"className":"flex h-fit max-h-full min-h-0 flex-col gap-3 overflow-y-auto pb-1.5"} as any)}>
                <LayoutSlot name="summary-section" slots={slots} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
