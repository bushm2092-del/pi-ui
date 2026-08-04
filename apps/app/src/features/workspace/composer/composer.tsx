import { workspaceData } from "../data/workspace-data";
import { useWorkspaceState } from "../workspace-state";
import { ComposerAddContext } from "./composer-add-context";
import { ComposerEditor } from "./composer-editor";
import { ComposerLayout } from "./layouts";
import { ComposerPermissions } from "./composer-permissions";
import { ComposerReasoning } from "./composer-reasoning";
import { ComposerSend } from "./composer-send";

export function Composer() {
  const settings = workspaceData.composer;
  const { draft, isSending, setDraft, sendDraft } = useWorkspaceState();

  function EditorSlot() {
    return (
      <ComposerEditor
        ariaLabel={settings.ariaLabel}
        draft={draft}
        onDraftChange={setDraft}
        onSubmit={sendDraft}
      />
    );
  }

  function SendSlot() {
    return <ComposerSend disabled={isSending || !draft.trim()} onSend={sendDraft} />;
  }

  return (
    <ComposerLayout
      slots={{
        "composer-editor": EditorSlot,
        "composer-add-context": ComposerAddContext,
        "composer-permissions": ComposerPermissions,
        "composer-reasoning": ComposerReasoning,
        "composer-send": SendSlot,
      }}
    />
  );
}
