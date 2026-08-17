import { useEffect, useState } from "react";
import type { Message } from "../domain";
import { AssistantMarkdown } from "./assistant-markdown";
import { StatusBlock } from "./components/assistant-content-blocks/assistant-status-block";
import { ThinkingBlock } from "./components/assistant-content-blocks/assistant-thinking-block";
import { ToolBlock } from "./components/assistant-content-blocks/assistant-tool-block";

export function AssistantContentBlocks({ message }: { message: Message }) {
  const elapsedLabel = useElapsedLabel(message);
  return (
    <div className="flex min-w-0 flex-col gap-5 [&>[data-activity-block]+[data-activity-block]]:-mt-3">
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
