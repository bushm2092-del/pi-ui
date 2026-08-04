import { LayoutSlot, type LayoutProps } from "../../layout";

export function SidebarScrollLayout({ slots = {}, rootProps = {} }: LayoutProps = {}) {
  return (
    <div {...({"data-app-action-sidebar-scroll":"","className":"vertical-scroll-fade-mask relative isolate flex min-h-0 flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto pb-[calc(var(--sidebar-footer-height)+var(--padding-row-x))] [--height-token-row:30px] [--radius-token-row:10px] [contain:layout_paint] _headerFadeMask_rqnbz_1 -mt-[var(--sidebar-scroll-header-spacing,8px)] pt-[var(--sidebar-scroll-content-top-padding,var(--sidebar-scroll-header-spacing,8px))]"} as any)} {...rootProps}>
      <LayoutSlot name="sidebar-shortcuts" slots={slots} />
      <div {...({"className":"contents"} as any)}>
        <div {...({"className":""} as any)}>
          <LayoutSlot name="sidebar-pinned" slots={slots} />
        </div>
        <LayoutSlot name="sidebar-projects" slots={slots} />
        <div {...({"className":""} as any)}>
          <LayoutSlot name="sidebar-recents" slots={slots} />
        </div>
      </div>
    </div>
  );
}
