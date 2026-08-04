import { LayoutSlot, type LayoutProps } from "../../layout";

export function SidebarProjectsLayout({ slots = {}, rootProps = {} }: LayoutProps = {}) {
  return (
    <section {...({"className":"relative px-row-x","data-app-action-sidebar-section":"","data-app-action-sidebar-section-collapsed":"false","data-app-action-sidebar-section-heading":"Projects"} as any)} {...rootProps}>
      <div {...({"className":"flex flex-col"} as any)}>
        <LayoutSlot name="sidebar-projects-header" slots={slots} />
        <div {...({"className":"overflow-hidden","style":{"height":"auto","opacity":"1","overflow":"visible"}} as any)}>
          <div {...({"className":"flex flex-col gap-px pt-1"} as any)}>
            <LayoutSlot name="sidebar-project-list" slots={slots} />
          </div>
        </div>
      </div>
    </section>
  );
}
