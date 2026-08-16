import { AssistantActions } from "./assistant-actions";
import { AssistantMarkdown } from "./assistant-markdown";
import { AssistantMessageLayout } from "./layouts";
import { ProcessingStatus } from "./processing-status";
import type { Message } from "../domain";
import { AssistantContentBlocks } from "./assistant-content-blocks";

export function AssistantMessage({ message }: { message: Message }) {
  if (message.status === "pending" && !message.content && !message.blocks?.length) {
    return <ProcessingStatus label="正在生成回复..." />;
  }

  return (
    <AssistantMessageLayout
      status={message.status}
      markdown={message.blocks?.length
        ? <AssistantContentBlocks message={message} />
        : <AssistantMarkdown content={message.content} />}
      actions={message.status === "pending" ? null : <AssistantActions />}
    />
  );
}
