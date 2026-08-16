import type { ReactNode } from "react";

interface UserMessageLayoutProps {
  content: ReactNode;
  actions: ReactNode;
}

export function UserMessageLayout({ content, actions }: UserMessageLayoutProps) {
  return (
    <div
      className="scroll-mt-4"
      data-content-search-unit-key="019fc7cf-25d9-7692-929f-bfb716396717:item-1"
      data-local-conversation-user-anchor="true"
    >
      <div className="flex flex-col items-end gap-2">
        <h4 className="sr-only select-none">你说：</h4>
        <div className="group flex w-full flex-col items-end justify-end gap-1">
          <div
            data-user-message-bubble="true"
            tabIndex={0}
            className="cursor-interaction max-w-[77%] min-w-0 overflow-hidden break-words rounded-2xl bg-token-foreground/5 px-3 py-2 text-start focus-visible:ring-2 focus-visible:ring-token-focus-border focus-visible:outline-none [&_.contain-inline-size]:[contain:initial]"
          >
            <div className="flex flex-col items-end gap-1">
              <div className="text-size-chat relative w-full min-w-0">
                <div>
                  <div className="text-size-chat whitespace-pre-wrap">{content}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-row-reverse items-center gap-1">{actions}</div>
        </div>
      </div>
    </div>
  );
}
