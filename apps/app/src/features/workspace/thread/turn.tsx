import { AssistantMessage } from "./assistant-message";
import type { Message } from "../domain";
import { UserMessage } from "./user-message";

export function Turn({ message }: { message: Message }) {
  return message.role === "user" ? (
    <UserMessage content={message.content} />
  ) : (
    <AssistantMessage message={message} />
  );
}
