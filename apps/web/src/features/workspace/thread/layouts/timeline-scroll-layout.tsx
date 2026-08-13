import type { ReactNode } from "react";

interface TimelineScrollLayoutProps {
  conversation: ReactNode;
  footer: ReactNode;
}

export function TimelineScrollLayout({
  conversation,
  footer,
}: TimelineScrollLayoutProps) {
  return (
    <div {...({"data-pip-anchor-host":"codex-main-thread","data-app-action-timeline-scroll":"","tabIndex":"0","className":"thread-scroll-container relative h-full overflow-x-hidden overflow-y-auto [overflow-anchor:none] [scroll-padding-bottom:var(--thread-scroll-padding-bottom,0px)] electron:[scrollbar-gutter:stable_both-edges] pt-(--thread-content-top-inset) [container-name:thread-content] [container-type:inline-size] focus:outline-none [&:has([data-thread-scroll-footer='true']:focus-within)]:[scroll-padding-bottom:0px] flex flex-col-reverse","style":{"--thread-scroll-padding-bottom":"130px"}} as any)}>
      <div {...({"className":"flex min-h-full shrink-0 flex-col justify-start","style":{"--thread-wide-block-inline-shift":"0px","transform":"none"}} as any)}>
        <div {...({"data-mcp-app-portal-target":"true","className":"mx-auto w-full max-w-(--thread-content-max-width) px-toolbar relative flex flex-1 shrink-0 flex-col pb-8"} as any)}>
          {conversation}
        </div>
        {footer}
      </div>
    </div>
  );
}
