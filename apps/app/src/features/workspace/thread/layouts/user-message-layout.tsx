import { LayoutSlot, type LayoutProps } from "../../layout";

export function UserMessageLayout({ slots = {}, rootProps = {} }: LayoutProps = {}) {
  return (
    <div {...({"className":"scroll-mt-4","data-content-search-unit-key":"019fc7cf-25d9-7692-929f-bfb716396717:item-1","data-local-conversation-user-anchor":"true"} as any)} {...rootProps}>
      <div {...({"className":"flex flex-col items-end gap-2"} as any)}>
        <h4 {...({"className":"sr-only select-none"} as any)}>
          {"你说："}
        </h4>
        <div {...({"className":"group flex w-full flex-col items-end justify-end gap-1"} as any)}>
          <div {...({"data-user-message-bubble":"true","tabIndex":"0","className":"bg-token-foreground/5 max-w-[77%] min-w-0 overflow-hidden break-words rounded-2xl px-3 py-2 [&_.contain-inline-size]:[contain:initial] text-start focus-visible:ring-2 focus-visible:ring-token-focus-border focus-visible:outline-none cursor-interaction"} as any)}>
            <div {...({"className":"flex flex-col items-end gap-1"} as any)}>
              <div {...({"className":"relative w-full min-w-0 text-size-chat"} as any)}>
                <div>
                  <div {...({"className":"text-size-chat whitespace-pre-wrap"} as any)}>
                    <LayoutSlot name="user-message-content" slots={slots} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div {...({"className":"flex flex-row-reverse items-center gap-1"} as any)}>
            <LayoutSlot name="user-actions" slots={slots} />
          </div>
        </div>
      </div>
    </div>
  );
}
