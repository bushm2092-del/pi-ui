import { LayoutSlot, type LayoutProps } from "../../layout";

export function MainViewportLayout({ slots = {}, rootProps = {} }: LayoutProps = {}) {
  return (
    <div {...({"className":"_MainContentViewport_1e9gb_72","data-app-shell-main-content-layout":"thread-edge-scroll","data-app-shell-right-panel-full-width":"false"} as any)} {...rootProps}>
      <LayoutSlot name="thread-frame" slots={slots} />
    </div>
  );
}
