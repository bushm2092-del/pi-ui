import type { ComponentProps } from "react";
import { joinClassNames } from "../renderers/shared";

export function MediaGrid({ className, node: _, ...props }: ComponentProps<"div"> & { node?: unknown }) {
  return <div className={joinClassNames("smk-markdown-media-grid", className)} data-markdown-node="media-grid" {...props} />;
}
