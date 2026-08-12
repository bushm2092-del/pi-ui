import type { ComponentProps } from "react";
import { joinClassNames } from "../renderers/shared";

export interface CitationProps extends ComponentProps<"span"> {
  node?: unknown;
  source?: string;
}

export function Citation({ children, className, node: _, source, ...props }: CitationProps) {
  return <span className={joinClassNames("smk-markdown-citation", className)} data-markdown-node="citation" data-source={source} role="note" {...props}>{children || source}</span>;
}
