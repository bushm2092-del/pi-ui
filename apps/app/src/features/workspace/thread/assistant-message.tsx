import { AssistantActions } from "./assistant-actions";
import { AssistantMarkdown } from "./assistant-markdown";
import { AssistantMessageLayout } from "./layouts";
import { ProcessingStatus } from "./processing-status";
import type { Message } from "../domain";

export function AssistantMessage({ message }: { message: Message }) {
  if (message.status === "pending") {
    return <ProcessingStatus label="正在生成回复..." />;
  }

  function Content() {
    return <AssistantMarkdown content={message.content} />;
  }

  return (
    <AssistantMessageLayout
      rootProps={{ "data-message-status": message.status }}
      slots={{
        "assistant-markdown": Content,
        "assistant-actions": AssistantActions,
      }}
    />
  );
}
