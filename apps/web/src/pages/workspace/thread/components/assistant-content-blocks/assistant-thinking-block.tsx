import { memo } from "react";
import { ChevronDown } from "lucide-react";

export const ThinkingBlock = memo(function ThinkingBlock({ content, label }: { content: string; label: string }) {
  if (!content) return null;
  return <details className="group border-b border-token-border pb-3 text-sm text-token-text-secondary">
    <summary className="flex min-h-8 cursor-pointer list-none items-center gap-1.5 rounded-md select-none focus-visible:outline-2 focus-visible:outline-token-focus-border">
      <span className="font-medium">{label}</span>
      <ChevronDown className="size-3.5 shrink-0 text-token-text-tertiary transition-transform group-open:rotate-180" />
    </summary>
    <div className="mt-3 whitespace-pre-wrap text-token-description-foreground">{content}</div>
  </details>;
});
