import type { ComponentProps } from "react";
import { FileText } from "lucide-react";
import { joinClassNames } from "../renderers/shared";

export interface FileReferenceProps extends Omit<ComponentProps<"span">, "children"> {
  children?: string;
  line?: string | number;
  path?: string;
  node?: unknown;
}

export function FileReference({ children, className, line, node: _, path, ...props }: FileReferenceProps) {
  const label = children || path || "file";
  return (
    <span className={joinClassNames("smk-markdown-file-reference", className)} data-line={line} data-markdown-node="file-reference" data-path={path} {...props}>
      <FileText aria-hidden="true" size={14} />
      <span>{label}</span>
      {line ? <span className="smk-markdown-file-reference-line">:{line}</span> : null}
    </span>
  );
}
