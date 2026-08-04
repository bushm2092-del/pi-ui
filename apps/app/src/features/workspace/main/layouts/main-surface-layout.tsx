import { LayoutSlot, type LayoutProps } from "../../layout";

export function MainSurfaceLayout({ slots = {}, rootProps = {} }: LayoutProps = {}) {
  return (
    <main {...({"className":"_MainContentSurface_1e9gb_32","data-app-shell-main-surface":"default"} as any)} {...rootProps}>
      <LayoutSlot name="main-header" slots={slots} />
      <div {...({"className":"relative isolate flex min-h-0 flex-1 overflow-hidden"} as any)}>
        <LayoutSlot name="main-viewport" slots={slots} />
      </div>
      <div {...({"id":"DndDescribedBy-1","style":{"display":"none"}} as any)}>
        {"\n    To pick up a draggable item, press the space bar.\n    While dragging, use the arrow keys to move the item.\n    Press space again to drop the item in its new position, or press escape to cancel.\n  "}
      </div>
      <div {...({"id":"DndLiveRegion-1","role":"status","aria-live":"assertive","aria-atomic":"true","style":{"position":"fixed","top":"0px","left":"0px","width":"1px","height":"1px","margin":"-1px","border":"0px","padding":"0px","overflow":"hidden","clip":"rect(0px, 0px, 0px, 0px)","clipPath":"inset(100%)","whiteSpace":"nowrap"}} as any)} />
    </main>
  );
}
