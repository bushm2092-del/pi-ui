import katex from "katex";
import { useMemo } from "react";

export interface MathRendererProps {
  className?: string;
  display?: boolean;
  source: string;
}

export function MathRenderer({ className, display = false, source }: MathRendererProps) {
  const html = useMemo(() => katex.renderToString(source, {
    displayMode: display,
    errorColor: "var(--smk-markdown-text-secondary)",
    output: "htmlAndMathml",
    strict: "warn",
    throwOnError: false,
    trust: false,
  }), [display, source]);

  return (
    <span
      className={["smk-markdown-math", display ? "smk-markdown-math--display" : "smk-markdown-math--inline", className].filter(Boolean).join(" ")}
      data-markdown-copy="math"
      data-markdown-copy-text={display ? `$$\n${source}\n$$` : `$${source}$`}
      data-markdown-node="math"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
