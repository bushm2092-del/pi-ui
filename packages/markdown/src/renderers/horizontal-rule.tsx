import type { ComponentProps } from "react";
import { joinClassNames } from "./shared";

export function MarkdownHorizontalRule({ node: _, className, ...props }: ComponentProps<"hr"> & { node?: unknown }) {
  return <hr className={joinClassNames("smk-markdown-horizontal-rule", className)} data-markdown-node="horizontal-rule" {...props} />;
}
