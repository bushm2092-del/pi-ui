import { AssistantMessage } from "./assistant-message";
import type { Message } from "../domain";
import { UserMessage } from "./user-message";
import { A2uiRenderer } from "../../a2ui";

export function Turn({ message }: { message: Message }) {
  if (message.role === "a2ui" && message.a2ui) {
    return <A2uiRenderer messages={message.a2ui.messages} />;
  }
  return message.role === "user" ? (
    <UserMessage content={message.content} />
  ) : (
    <AssistantMessage message={message} />
  );
}
