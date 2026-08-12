import type { ComponentProps } from "react";
import { joinClassNames } from "./shared";

export function MarkdownInlineCode({ node: _, className, ...props }: ComponentProps<"code"> & { node?: unknown }) {
  return <code className={joinClassNames("smk-markdown-inline-code", className)} data-markdown-copy="inline-code" data-markdown-node="inline-code" {...props} />;
}
