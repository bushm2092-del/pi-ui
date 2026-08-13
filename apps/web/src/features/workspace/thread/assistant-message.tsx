import { AssistantActions } from "./assistant-actions";
import { AssistantMarkdown } from "./assistant-markdown";
import { AssistantMessageLayout } from "./layouts";
import { ProcessingStatus } from "./processing-status";
import type { Message } from "../domain";

export function AssistantMessage({ message }: { message: Message }) {
  if (message.status === "pending" && !message.content) {
    return <ProcessingStatus label="正在生成回复..." />;
  }

  return (
    <AssistantMessageLayout
      status={message.status}
      markdown={<AssistantMarkdown content={message.content} />}
      actions={message.status === "pending"
        ? <ProcessingStatus label="正在生成回复..." />
        : <AssistantActions />}
    />
  );
}
