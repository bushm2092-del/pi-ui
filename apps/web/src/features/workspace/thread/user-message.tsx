import { UserActions } from "./user-actions";
import { UserMessageLayout } from "./layouts";

function UserMessageContent({ content }: { content: string }) {
  return (
    <div
      data-selected-text-overlay-target="_r_kc_"
      dir="auto"
      className="pi-markdown-content [&amp;>*:first-child]:mt-0 [&amp;_li+li]:!mt-0 [&amp;_li>ol]:!mt-0 [&amp;_li>p+p]:!mt-0 [&amp;_li>ul]:!mt-0 [&amp;_ol]:!ps-6 [&amp;_p]:!m-0 [&amp;_p+p]:!mt-5 [&amp;_ul]:!ps-6"
    >
      <p className="pi-markdown-text pi-markdown-paragraph">
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
