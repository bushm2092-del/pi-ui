import { LayoutSlot, type LayoutProps } from "../../layout";

export function ProjectItemLayout1({ slots = {}, rootProps = {} }: LayoutProps = {}) {
  return (
    <div {...({"className":"after:block after:h-px after:content-[''] last:after:hidden touch-none","tabIndex":"0","aria-disabled":"false","aria-roledescription":"sortable","aria-describedby":"DndDescribedBy-3","role":"listitem","style":{"transition":"transform linear"}} as any)} {...rootProps}>
      <div {...({"className":"overflow-hidden","style":{"height":"auto","opacity":"1","overflow":"visible"}} as any)}>
        <div {...({"data-sidebar-project-kind":"local","className":"group/cwd relative flex flex-col","role":"listitem","aria-label":"pi","style":{"transition":"transform linear"}} as any)}>
          <div {...({"className":"pointer-events-none absolute top-[var(--height-token-row)] bottom-0 left-0 z-10 w-8"} as any)} />
          <span {...({"data-state":"closed","className":"contents"} as any)}>
            <LayoutSlot name="sidebar-project-row" slots={slots} />
          </span>
          <div {...({"className":"overflow-hidden","style":{"height":"auto","opacity":"1","overflow":"visible"}} as any)}>
            <div {...({"className":"pt-0.5 pb-2"} as any)}>
              <LayoutSlot name="sidebar-project-threads" slots={slots} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
