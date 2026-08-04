import { LayoutSlot, type LayoutProps } from "../../layout";

export function SidebarProjectListLayout({ slots = {}, rootProps = {} }: LayoutProps = {}) {
  return (
    <div {...({"className":"flex flex-col","role":"list","tabIndex":"-1"} as any)} {...rootProps}>
      <LayoutSlot name="sidebar-project-item-0" slots={slots} />
      <LayoutSlot name="sidebar-project-item-1" slots={slots} />
      <LayoutSlot name="sidebar-project-item-2" slots={slots} />
      <LayoutSlot name="sidebar-project-item-3" slots={slots} />
      <LayoutSlot name="sidebar-project-item-4" slots={slots} />
      <LayoutSlot name="sidebar-project-item-5" slots={slots} />
    </div>
  );
}
