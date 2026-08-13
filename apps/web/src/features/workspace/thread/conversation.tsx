import { ConversationLayout } from "./layouts";
import { Turn } from "./turn";
import { useConversation } from "../api";

export function Conversation() {
  const { data: conversation, error, isPending } = useConversation();

  if (isPending) return <ConversationStatus>正在加载真实会话...</ConversationStatus>;
  if (error) return <ConversationStatus>{error.message}</ConversationStatus>;
  if (!conversation) return null;

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

function ConversationStatus({ children }: { children: React.ReactNode }) {
  return (
    <ConversationLayout>
      <p className="py-8 text-center text-sm text-token-description-foreground">{children}</p>
    </ConversationLayout>
  );
}
