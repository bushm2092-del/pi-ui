import { memo } from "react";
import { BookOpen, ChevronRight, Pencil, SquareTerminal, Wrench } from "lucide-react";
import { A2uiRenderer } from "../../../../a2ui";
import type { AssistantToolBlock } from "../../../domain";
import { describeToolActivity, formatToolDetails } from "../../utils/assistant-content-block-utils";

export const ToolBlock = memo(function ToolBlock({ block }: { block: AssistantToolBlock }) {
  const activity = describeToolActivity(block);
  const Icon = activity.icon;
  const details = formatToolDetails(block);
  return <details className="group text-sm text-token-text-secondary" data-activity-block="true" data-tool-activity={block.status}>
    <summary className="-mx-2 flex min-h-8 cursor-pointer list-none items-center gap-2 rounded-md px-2 select-none transition-colors hover:bg-token-list-hover-background focus-visible:outline-2 focus-visible:outline-token-focus-border"><Icon className={`size-4 shrink-0 ${block.status === "failed" ? "text-red-600 dark:text-red-400" : "text-token-text-tertiary"} ${block.status === "running" || block.status === "preparing" ? "animate-pulse" : ""}`} /><span className={`min-w-0 flex-1 truncate font-medium ${block.status === "failed" ? "text-red-600 dark:text-red-400" : ""}`}>{activity.label}</span><ChevronRight className="size-3.5 shrink-0 text-token-text-tertiary opacity-40 transition-all group-hover:opacity-100 group-open:rotate-90 group-open:opacity-100" /></summary>
    <div className="ml-6 mt-1.5 min-w-0 border-l border-token-border pl-3">{details && <pre className="max-h-72 overflow-auto rounded-md bg-token-list-hover-background p-3 whitespace-pre-wrap break-words text-xs leading-5 text-token-description-foreground">{details}</pre>}{block.a2ui && <div className="mt-3"><A2uiRenderer messages={block.a2ui.messages} /></div>}</div>
  </details>;
});
