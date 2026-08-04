import { LayoutSlot, type LayoutProps } from "../../layout";

export function ConversationLayout({ slots = {}, rootProps = {} }: LayoutProps = {}) {
  return (
    <div {...({"data-thread-find-target":"conversation","className":"relative flex flex-col gap-3 electron:[--color-token-description-foreground:color-mix(in_srgb,var(--color-token-foreground)_70%,transparent)]"} as any)} {...rootProps}>
      <div {...({"className":"relative shrink-0"} as any)}>
        <div {...({"className":"flex flex-col","style":{"gap":"12px","marginTop":"0px"}} as any)}>
          <div>
            <LayoutSlot name="turn" slots={slots} />
          </div>
        </div>
      </div>
      <div {...({"aria-hidden":"true","className":"shrink-0","style":{"height":"0px"}} as any)} />
    </div>
  );
}
