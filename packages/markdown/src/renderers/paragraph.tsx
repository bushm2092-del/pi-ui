import type { ComponentProps } from "react";
import { joinClassNames } from "./shared";

export function MarkdownParagraph({ node: _, className, dir, ...props }: ComponentProps<"p"> & { node?: unknown }) {
  return <p className={joinClassNames("smk-markdown-text", "smk-markdown-paragraph", className)} data-markdown-node="paragraph" dir={dir ?? "auto"} {...props} />;
}
