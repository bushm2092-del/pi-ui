import { LayoutSlot, type LayoutProps } from "../../layout";

export function SidebarHeaderLayout({ slots = {}, rootProps = {} }: LayoutProps = {}) {
  return (
    <div {...({"className":"relative z-10 flex shrink-0 flex-col gap-2 px-row-x pb-(--sidebar-scroll-header-spacing)"} as any)} {...rootProps}>
      <LayoutSlot name="sidebar-mode" slots={slots} />
      <LayoutSlot name="sidebar-new-conversation" slots={slots} />
    </div>
  );
}
