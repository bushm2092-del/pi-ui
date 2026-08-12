import type { ComponentProps } from "react";
import { joinClassNames } from "./shared";

export function MarkdownImage({ node: _, className, alt = "", loading = "lazy", ...props }: ComponentProps<"img"> & { node?: unknown }) {
  return <img alt={alt} className={joinClassNames("smk-markdown-image", className)} data-markdown-node="image" loading={loading} {...props} />;
}
