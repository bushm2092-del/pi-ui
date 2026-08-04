import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "../lib";
import { IconButton } from "./icon-button";
import { Tooltip } from "./tooltip";

export function CodeBlock({ code, language = "text", className }: { code: string; language?: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className={cn("overflow-hidden rounded-lg border border-border-subtle bg-surface-app", className)}>
      <div className="flex h-8 items-center justify-between border-b border-border-subtle px-3 text-xs text-foreground-tertiary">
        <span>{language}</span>
        <Tooltip content={copied ? "已复制" : "复制代码"}>
          <IconButton size="sm" aria-label="复制代码" onClick={() => void copyCode()}>
            {copied ? <Check /> : <Copy />}
          </IconButton>
        </Tooltip>
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-xs leading-5 text-foreground-primary">
        <code>{code}</code>
      </pre>
    </div>
  );
}
