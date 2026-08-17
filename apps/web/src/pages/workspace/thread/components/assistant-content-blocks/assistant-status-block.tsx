import { memo } from "react";
import { Check, ChevronRight, CircleAlert, LoaderCircle } from "lucide-react";
import type { AssistantStatusBlock } from "../../../domain";

export const StatusBlock = memo(function StatusBlock({ block }: { block: AssistantStatusBlock }) {
  const icon = block.status === "running" ? <LoaderCircle className="size-3.5 animate-spin" /> : block.status === "failed" ? <CircleAlert className="size-3.5" /> : <Check className="size-3.5" />;
  const tone = block.status === "failed" ? "text-red-600 dark:text-red-400" : "text-token-text-secondary";
  if (!block.details) return <div className={`flex min-h-8 items-center gap-2 text-sm font-medium ${tone}`} data-activity-block="true">{icon}<span>{block.label}</span></div>;
  return <details className={`group text-sm ${tone}`} data-activity-block="true">
    <summary className="-mx-2 flex min-h-8 cursor-pointer list-none items-center gap-2 rounded-md px-2 font-medium select-none transition-colors hover:bg-token-list-hover-background focus-visible:outline-2 focus-visible:outline-token-focus-border"><ChevronRight className="size-3.5 shrink-0 transition-transform group-open:rotate-90" />{icon}<span>{block.label}</span></summary>
    <pre className="ml-6 mt-1.5 max-h-64 overflow-auto rounded-md border-l border-token-border bg-token-list-hover-background p-3 whitespace-pre-wrap break-words text-xs leading-5 text-token-description-foreground">{block.details}</pre>
  </details>;
});
