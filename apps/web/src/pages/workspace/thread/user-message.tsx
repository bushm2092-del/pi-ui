import { UserActions } from "./user-actions";
import { UserMessageLayout } from "./layouts";

function UserMessageContent({ content }: { content: string }) {
  return (
    <div
      data-selected-text-overlay-target="_r_kc_"
      dir="auto"
      className="text-size-chat text-token-text-primary leading-[calc(var(--codex-chat-font-size)+8px)] [overflow-wrap:anywhere] [&>*:first-child]:mt-0 [&_li+li]:!mt-0 [&_li>ol]:!mt-0 [&_li>p+p]:!mt-0 [&_li>ul]:!mt-0 [&_ol]:!ps-6 [&_p]:!m-0 [&_p+p]:!mt-5 [&_ul]:!ps-6"
    >
      <p dir="auto" className="text-size-chat leading-[calc(var(--codex-chat-font-size)+8px)]">
        {content}
      </p>
    </div>
  );
}

export function UserMessage({ content }: { content: string }) {
  return (
    <UserMessageLayout
      content={<UserMessageContent content={content} />}
      actions={<UserActions />}
    />
  );
}
