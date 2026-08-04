import { LayoutSlot, type LayoutProps } from "../../layout";

export function ThreadFrameLayout({ slots = {}, rootProps = {} }: LayoutProps = {}) {
  return (
    <div {...({"className":"_MainContentFrame_1e9gb_96","data-app-shell-thread-edge-divider":"true"} as any)} {...rootProps}>
      <div {...({"className":"relative flex min-h-0 flex-1"} as any)}>
        <div {...({"aria-hidden":"true","data-app-shell-main-content-top-fade":"full-bleed","className":"_MainContentTopFade_1e9gb_126"} as any)} />
        <div {...({"className":"h-full min-h-0 min-w-0 flex-1"} as any)}>
          <div {...({"className":"relative h-full min-h-0"} as any)}>
            <div {...({"className":"h-full min-h-0"} as any)}>
              <div {...({"className":"relative flex h-full flex-col min-h-0","data-vscode-context":"{\"chatgpt.supportsNewChatMenu\": true}"} as any)}>
                <div {...({"className":"sticky top-0 z-10"} as any)} />
                <div {...({"className":"flex min-h-0 flex-1 flex-col [&_[data-thread-find-target=conversation]]:scroll-mt-24"} as any)}>
                  <div {...({"className":"relative mx-auto flex min-h-0 w-full flex-1 flex-col"} as any)}>
                    <div {...({"className":"min-h-0 flex-1"} as any)}>
                      <div {...({"className":"relative h-full flex-1 [content-visibility:auto]"} as any)}>
                        <LayoutSlot name="timeline-scroll" slots={slots} />
                      </div>
                      <LayoutSlot name="summary-panel" slots={slots} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
