import { ConversationLayout } from "./layouts";
import { Turn } from "./turn";
import { useWorkspaceState } from "../workspace-state";

export function Conversation() {
  const { messages } = useWorkspaceState();

  function MessageList() {
    return (
      <div className="flex flex-col gap-4" data-message-list="true">
        {messages.map((message) => (
          <Turn key={message.id} message={message} />
        ))}
      </div>
    );
  }

  return <ConversationLayout slots={{ turn: MessageList }} />;
}
