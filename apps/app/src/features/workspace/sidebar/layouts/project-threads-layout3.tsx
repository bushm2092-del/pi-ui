import { LayoutSlot, type LayoutProps } from "../../layout";

export function ProjectThreadsLayout3({ slots = {}, rootProps = {} }: LayoutProps = {}) {
  return (
    <div {...({"data-app-action-sidebar-project-list-id":"local-928679e41378791b9dc7f32353473f8f","data-app-action-sidebar-project-show-all":"false"} as any)} {...rootProps}>
      <div {...({"className":"isolate flex flex-col [contain:layout]"} as any)}>
        <div {...({"className":"flex flex-col","role":"list","tabIndex":"-1","aria-label":"desktop中的已安排任务"} as any)}>
          <LayoutSlot name="sidebar-thread-item-0" slots={slots} />
          <LayoutSlot name="sidebar-thread-item-1" slots={slots} />
          <LayoutSlot name="sidebar-thread-item-2" slots={slots} />
          <LayoutSlot name="sidebar-thread-item-3" slots={slots} />
          <LayoutSlot name="sidebar-thread-item-4" slots={slots} />
          <LayoutSlot name="sidebar-thread-item-5" slots={slots} />
        </div>
      </div>
    </div>
  );
}
