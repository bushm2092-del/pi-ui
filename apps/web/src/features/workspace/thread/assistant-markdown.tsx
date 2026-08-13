import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function AssistantMarkdown({ content }: { content: string }) {
  return (
    <div className="[&amp;>*:first-child]:mt-0 [&amp;>*:last-child]:mb-0 [&amp;>ol:first-child]:mt-0 [&amp;>ul:first-child]:mt-0">
      <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
    </div>
  );
}
