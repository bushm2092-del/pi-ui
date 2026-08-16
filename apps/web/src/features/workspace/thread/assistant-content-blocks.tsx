import { useEffect, useState } from "react";
import { BookOpen, Check, ChevronDown, ChevronRight, CircleAlert, LoaderCircle, Pencil, SquareTerminal, Wrench } from "lucide-react";
import { A2uiRenderer } from "../../a2ui";
import type { AssistantStatusBlock, AssistantToolBlock, Message } from "../domain";
import { AssistantMarkdown } from "./assistant-markdown";

export function AssistantContentBlocks({ message }: { message: Message }) {
  const elapsedLabel = useElapsedLabel(message);
  return (
    <div className="flex min-w-0 flex-col gap-5">
      {message.blocks?.map((block) => {
        if (block.type === "text") {
          return block.content
            ? <AssistantMarkdown key={block.id} content={block.content} isAnimating={message.status === "pending"} />
            : null;
        }
        if (block.type === "thinking") return <ThinkingBlock key={block.id} content={block.content} label={elapsedLabel} />;
        if (block.type === "tool") return <ToolBlock key={block.id} block={block} />;
        return <StatusBlock key={block.id} block={block} />;
      })}
    </div>
  );
}

function ThinkingBlock({ content, label }: { content: string; label: string }) {
  if (!content) return null;
  return (
    <details className="group border-b border-token-border pb-3 text-sm text-token-text-secondary">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 select-none focus-visible:outline-2 focus-visible:outline-token-focus-border">
        <span>{label}</span>
        <ChevronDown className="size-3.5 shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <div className="mt-3 whitespace-pre-wrap text-token-description-foreground">
        {content}
      </div>
    </details>
  );
}

function ToolBlock({ block }: { block: AssistantToolBlock }) {
  const activity = describeToolActivity(block);
  const Icon = activity.icon;
  const details = formatToolDetails(block);

  return (
    <details className="group text-sm text-token-text-secondary" data-tool-activity={block.status}>
      <summary className="flex cursor-pointer list-none items-center gap-2.5 select-none focus-visible:outline-2 focus-visible:outline-token-focus-border">
        <Icon className={`size-5 shrink-0 ${block.status === "running" || block.status === "preparing" ? "animate-pulse" : ""}`} />
        <span className={`min-w-0 flex-1 truncate ${block.status === "failed" ? "text-red-600 dark:text-red-400" : ""}`}>
          {activity.label}
        </span>
        <ChevronRight className="size-3.5 shrink-0 opacity-0 transition-all group-hover:opacity-100 group-open:rotate-90 group-open:opacity-100" />
      </summary>
      <div className="mt-3 min-w-0 pl-[30px]">
        {details && <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-token-description-foreground">{details}</pre>}
        {block.a2ui && <div className="mt-3"><A2uiRenderer messages={block.a2ui.messages} /></div>}
      </div>
    </details>
  );
}

function describeToolActivity(block: AssistantToolBlock): { icon: typeof Wrench; label: string } {
  const name = block.name.toLowerCase();
  const kind = /^(read|grep|find|ls)$/.test(name)
    ? "read"
    : /^(bash|shell|terminal|终端命令)$/.test(name)
      ? "command"
      : /^(edit|write|apply_patch)$/.test(name) ? "edit" : "other";
  const icon = kind === "read" ? BookOpen : kind === "command" ? SquareTerminal : kind === "edit" ? Pencil : Wrench;
  if (block.status === "failed") {
    return { icon, label: kind === "read" ? "读取文件失败" : kind === "command" ? "运行命令失败" : kind === "edit" ? "编辑文件失败" : `${block.name} 失败` };
  }
  if (block.status === "running" || block.status === "preparing") {
    return { icon, label: kind === "read" ? "正在读取文件" : kind === "command" ? "正在运行命令" : kind === "edit" ? "正在编辑文件" : `正在使用 ${block.name}` };
  }
  return { icon, label: kind === "read" ? "已读取文件" : kind === "command" ? "运行了命令" : kind === "edit" ? "编辑了文件" : `使用了 ${block.name}` };
}

function StatusBlock({ block }: { block: AssistantStatusBlock }) {
  const icon = block.status === "running"
    ? <LoaderCircle className="size-3.5 animate-spin" />
    : block.status === "failed"
      ? <CircleAlert className="size-3.5" />
      : <Check className="size-3.5" />;
  const tone = block.status === "failed" ? "text-red-600 dark:text-red-400" : "text-token-text-secondary";

  if (!block.details) {
    return <div className={`flex items-center gap-2 text-sm ${tone}`}>{icon}<span>{block.label}</span></div>;
  }
  return (
    <details className={`group text-sm ${tone}`}>
      <summary className="flex cursor-pointer list-none items-center gap-2 select-none focus-visible:outline-2 focus-visible:outline-token-focus-border">
        <ChevronRight className="size-3.5 shrink-0 transition-transform group-open:rotate-90" />
        {icon}
        <span>{block.label}</span>
      </summary>
      <pre className="mt-2 max-h-64 overflow-auto border-l border-token-border pl-4 whitespace-pre-wrap break-words text-xs text-token-description-foreground">{block.details}</pre>
    </details>
  );
}

function useElapsedLabel(message: Message): string {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (message.status !== "pending") return;
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, [message.status]);
  if (message.status !== "pending" && !message.completedAt) return "思考过程";
  const startedAt = Date.parse(message.createdAt);
  const endedAt = message.completedAt ? Date.parse(message.completedAt) : now;
  if (!Number.isFinite(startedAt) || !Number.isFinite(endedAt)) return "思考过程";
  return `耗时 ${formatDuration(Math.max(0, endedAt - startedAt))}`;
}

function formatDuration(milliseconds: number): string {
  const seconds = Math.max(1, Math.round(milliseconds / 1_000));
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return minutes > 0 ? `${minutes}分钟 ${remainder}秒` : `${seconds}秒`;
}

function formatToolDetails(block: AssistantToolBlock): string {
  const sections: string[] = [];
  const args = block.arguments !== undefined ? formatUnknown(block.arguments) : block.argumentText;
  if (args) sections.push(`参数\n${args}`);
  if (block.output) sections.push(`输出\n${block.output}`);
  if (block.details !== undefined && !block.a2ui) sections.push(`详情\n${formatUnknown(block.details)}`);
  return sections.join("\n\n");
}

function formatUnknown(value: unknown): string {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
