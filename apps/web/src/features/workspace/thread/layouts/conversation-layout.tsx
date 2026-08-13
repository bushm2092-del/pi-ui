import type { ReactNode } from "react";

export function ConversationLayout({ children }: { children: ReactNode }) {
  return (
    <div {...({"data-thread-find-target":"conversation","className":"relative flex flex-col gap-3 electron:[--color-token-description-foreground:color-mix(in_srgb,var(--color-token-foreground)_70%,transparent)]"} as any)}>
      <div {...({"className":"relative shrink-0"} as any)}>
        <div {...({"className":"flex flex-col","style":{"gap":"12px","marginTop":"0px"}} as any)}>
          <div>
            {children}
          </div>
        </div>
      </div>
      <div {...({"aria-hidden":"true","className":"shrink-0","style":{"height":"0px"}} as any)} />
    </div>
  );
}
