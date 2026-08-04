import { LayoutSlot, type LayoutProps } from "../../layout";

export function ProjectThreadsLayout0({ slots = {}, rootProps = {} }: LayoutProps = {}) {
  return (
    <div {...({"data-app-action-sidebar-project-list-id":"939fa940-5326-4daf-9e1f-503d1b499533","data-app-action-sidebar-project-show-all":"false"} as any)} {...rootProps}>
      <div {...({"className":"isolate flex flex-col [contain:layout]"} as any)}>
        <div {...({"className":"flex flex-col","role":"list","tabIndex":"-1","aria-label":"pi-ui中的已安排任务"} as any)}>
          <LayoutSlot name="sidebar-thread-item-0" slots={slots} />
          <LayoutSlot name="sidebar-thread-item-1" slots={slots} />
        </div>
      </div>
    </div>
  );
}
