import { workspaceData } from "../data/workspace-data";
import { useAbortMessage, useConversation, useSendMessage } from "../api";
import { selectDraft, selectSetDraft, useWorkspaceUi } from "../model";
import { ComposerAddContext } from "./composer-add-context";
import { ComposerEditor } from "./composer-editor";
import { ComposerLayout } from "./layouts";
import { ComposerPermissions } from "./composer-permissions";
import { ComposerReasoning } from "./composer-reasoning";
import { ComposerSend } from "./composer-send";

export function Composer() {
  const settings = workspaceData.composer;
  const conversationId = workspaceData.conversation.id;
  const sendMessage = useSendMessage(conversationId);
  const abortMessage = useAbortMessage(conversationId);
  const { data: conversation } = useConversation(conversationId);
  const draft = useWorkspaceUi(selectDraft(conversationId));
  const setDraft = useWorkspaceUi(selectSetDraft);
  const isRunning = sendMessage.isPending || conversation?.runtime?.isStreaming === true;

  async function sendDraft() {
    if (!draft.trim() || isRunning) return;
    setDraft(conversationId, "");
    await sendMessage.mutateAsync(draft).catch(() => undefined);
  }

  return (
    <ComposerLayout
      editor={
        <ComposerEditor
          ariaLabel={settings.ariaLabel}
          draft={draft}
          disabled={isRunning}
          onDraftChange={(nextDraft) => setDraft(conversationId, nextDraft)}
          onSubmit={sendDraft}
        />
      }
      addContext={<ComposerAddContext />}
      permissions={<ComposerPermissions />}
      reasoning={<ComposerReasoning />}
      send={
        <ComposerSend
          mode={isRunning ? "stop" : "send"}
          disabled={isRunning ? abortMessage.isPending : !draft.trim()}
          onAction={isRunning
            ? () => abortMessage.mutateAsync().catch(() => undefined)
            : sendDraft}
        />
      }
    />
  );
}
