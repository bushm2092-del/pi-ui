import type { ComponentProps } from "react";
import { joinClassNames } from "./shared";

export function MarkdownBlockquote({ node: _, className, dir, ...props }: ComponentProps<"blockquote"> & { node?: unknown }) {
  return <blockquote className={joinClassNames("smk-markdown-text", "smk-markdown-blockquote", className)} data-markdown-node="blockquote" dir={dir ?? "auto"} {...props} />;
}
