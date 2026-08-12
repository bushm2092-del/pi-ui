import { StreamingMarkdown } from "./streaming-markdown";
import type { StaticMarkdownProps } from "./types";

export function StaticMarkdown(props: StaticMarkdownProps) {
  return <StreamingMarkdown {...props} isAnimating={false} mode="static" />;
}
