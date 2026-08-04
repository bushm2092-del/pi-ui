import { useState } from "react";
import { Check, Copy, WrapText } from "lucide-react";
import { cn } from "../../lib";
import { IconButton } from "../icon-button";
import { Tooltip } from "../tooltip";

interface MarkdownCodeBlockProps {
  code: string;
  language?: string;
}

export function MarkdownCodeBlock({
  code,
  language = "text",
}: MarkdownCodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [wrap, setWrap] = useState(false);

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div
      data-markdown-copy="code-block"
      className="pi-markdown-code-block relative w-full min-w-0 overflow-hidden rounded-lg bg-surface-code contain-inline-size"
    >
      <div className="flex min-h-8 items-center py-1 pe-2 ps-2 font-sans text-sm text-foreground-secondary select-none">
        <div className="min-w-0 flex-1 truncate">{language}</div>
        <div className="ms-auto flex shrink-0 items-center gap-px">
          <Tooltip content={wrap ? "关闭自动换行" : "启用自动换行"}>
            <IconButton
              size="sm"
              aria-label={wrap ? "关闭自动换行" : "启用自动换行"}
              aria-pressed={wrap}
              onClick={() => setWrap((current) => !current)}
            >
              <WrapText />
            </IconButton>
          </Tooltip>
          <Tooltip content={copied ? "已复制" : "复制"}>
            <IconButton size="sm" aria-label="复制" onClick={() => void copyCode()}>
              {copied ? <Check /> : <Copy />}
            </IconButton>
          </Tooltip>
        </div>
      </div>
      <pre
        className={cn(
          "text-size-chat overflow-auto p-2 font-mono",
          wrap ? "whitespace-pre-wrap break-words" : "whitespace-pre",
        )}
        dir="ltr"
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}
