import { ConversationLayout } from "./layouts";
import { Turn } from "./turn";
import { useConversation } from "../api";

export function Conversation() {
  const { data: conversation } = useConversation();

  return (
    <ConversationLayout>
      <div className="flex flex-col gap-4" data-message-list="true">
        {conversation.messages.map((message) => (
          <Turn key={message.id} message={message} />
        ))}
      </div>
    </ConversationLayout>
  );
}
