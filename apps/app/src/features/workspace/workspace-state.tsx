import { createContext, useContext, useMemo, useState } from "react";
import { createMessage, type Message } from "./domain";
import { workspaceData } from "./data/workspace-data";
import { useWorkspaceRepository } from "./data/workspace-repository-context";

interface WorkspaceState {
  conversationId: string;
  messages: Message[];
  draft: string;
  isSending: boolean;
  summaryOpen: boolean;
  setDraft: (draft: string) => void;
  sendDraft: () => Promise<void>;
  toggleSummary: () => void;
}

const WorkspaceStateContext = createContext<WorkspaceState | undefined>(undefined);

export function WorkspaceStateProvider({ children }: { children: React.ReactNode }) {
  const repository = useWorkspaceRepository();
  const conversationId = workspaceData.conversation.id;
  const [messages, setMessages] = useState(workspaceData.conversation.messages);
  const [draft, setDraft] = useState(workspaceData.composer.initialDraft);
  const [isSending, setIsSending] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  async function sendDraft() {
    const content = draft.trim();
    if (!content || isSending) return;

    const userMessage = createMessage("user", content);
    const pendingMessage = createMessage("assistant", "", "pending");
    setMessages((current) => [...current, userMessage, pendingMessage]);
    setDraft("");
    setIsSending(true);

    try {
      const reply = await repository.sendMessage(conversationId, content);
      setMessages((current) =>
        current.map((message) =>
          message.id === pendingMessage.id
            ? { ...message, content: reply, status: "complete" }
            : message,
        ),
      );
    } catch {
      setMessages((current) =>
        current.map((message) =>
          message.id === pendingMessage.id
            ? { ...message, content: "消息发送失败，请重试。", status: "failed" }
            : message,
        ),
      );
    } finally {
      setIsSending(false);
    }
  }

  const value = useMemo(
    () => ({
      conversationId,
      messages,
      draft,
      isSending,
      summaryOpen,
      setDraft,
      sendDraft,
      toggleSummary: () => setSummaryOpen((open) => !open),
    }),
    [conversationId, draft, isSending, messages, summaryOpen],
  );

  return (
    <WorkspaceStateContext.Provider value={value}>
      {children}
    </WorkspaceStateContext.Provider>
  );
}

export function useWorkspaceState() {
  const value = useContext(WorkspaceStateContext);
  if (!value) throw new Error("Workspace state is unavailable");
  return value;
}
