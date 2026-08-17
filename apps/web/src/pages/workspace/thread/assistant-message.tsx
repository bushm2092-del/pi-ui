import { AssistantActions } from "./assistant-actions";
import { AssistantMessageLayout } from "./layouts";
import { ProcessingStatus } from "./processing-status";
import type { Message } from "../domain";
import { AssistantContentBlocks } from "./assistant-content-blocks";

export function AssistantMessage({ message }: { message: Message }) {
  if (message.status === "pending" && !message.blocks?.length) {
    return <ProcessingStatus label="正在生成回复..." />;
  }

  return (
    <AssistantMessageLayout
      status={message.status}
      markdown={<AssistantContentBlocks message={message} />}
      actions={message.status === "pending" ? null : <AssistantActions />}
    />
  );
}
