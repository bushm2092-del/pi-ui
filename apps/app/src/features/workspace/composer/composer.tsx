import { workspaceData } from "../data/workspace-data";
import { useSendMessage } from "../api";
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
  const draft = useWorkspaceUi(selectDraft(conversationId));
  const setDraft = useWorkspaceUi(selectSetDraft);

  async function sendDraft() {
    if (!draft.trim() || sendMessage.isPending) return;
    setDraft(conversationId, "");
    await sendMessage.mutateAsync(draft).catch(() => undefined);
  }

  return (
    <ComposerLayout
      editor={
        <ComposerEditor
          ariaLabel={settings.ariaLabel}
          draft={draft}
          onDraftChange={(nextDraft) => setDraft(conversationId, nextDraft)}
          onSubmit={sendDraft}
        />
      }
      addContext={<ComposerAddContext />}
      permissions={<ComposerPermissions />}
      reasoning={<ComposerReasoning />}
      send={
        <ComposerSend
          disabled={sendMessage.isPending || !draft.trim()}
          onSend={sendDraft}
        />
      }
    />
  );
}
