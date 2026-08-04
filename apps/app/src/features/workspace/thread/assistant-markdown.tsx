import { lazy, Suspense } from "react";

const Markdown = lazy(() =>
  import("@pi/ui/markdown").then((module) => ({ default: module.Markdown })),
);

export function AssistantMarkdown({ content }: { content: string }) {
  return (
    <Suspense fallback={<div className="text-token-text-secondary">正在渲染...</div>}>
      <Markdown className="[&amp;>*:first-child]:mt-0 _markdownContent_1q3nk_74 [&amp;>*:last-child]:mb-0 [&amp;>ol:first-child]:mt-0 [&amp;>ul:first-child]:mt-0">
        {content}
      </Markdown>
    </Suspense>
  );
}
