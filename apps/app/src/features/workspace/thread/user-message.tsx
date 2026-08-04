import { UserActions } from "./user-actions";
import { UserMessageLayout } from "./layouts";

function UserMessageContent({ content }: { content: string }) {
  return (
    <div
      data-selected-text-overlay-target="_r_kc_"
      dir="auto"
      className="[&amp;>*:first-child]:mt-0 _markdownContent_1q3nk_74 [&amp;_li+li]:!mt-0 [&amp;_li>ol]:!mt-0 [&amp;_li>p+p]:!mt-0 [&amp;_li>ul]:!mt-0 [&amp;_ol]:!ps-6 [&amp;_p]:!m-0 [&amp;_p+p]:!mt-5 [&amp;_ul]:!ps-6"
    >
      <p className="_markdownText_1q3nk_112 _paragraph_1q3nk_103">
        {content}
      </p>
    </div>
  );
}

export function UserMessage({ content }: { content: string }) {
  function Content() {
    return <UserMessageContent content={content} />;
  }

  return (
    <UserMessageLayout
      slots={{
        "user-message-content": Content,
        "user-actions": UserActions,
      }}
    />
  );
}
