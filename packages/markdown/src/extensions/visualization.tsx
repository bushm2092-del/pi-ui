import type { ComponentProps } from "react";
import { joinClassNames } from "../renderers/shared";

export interface VisualizationProps extends ComponentProps<"div"> {
  kind?: string;
  node?: unknown;
}

export function Visualization({ className, kind, node: _, ...props }: VisualizationProps) {
  return <div className={joinClassNames("smk-markdown-visualization", className)} data-kind={kind} data-markdown-node="visualization" {...props} />;
}
