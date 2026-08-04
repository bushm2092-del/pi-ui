import { workspaceData } from "../data/workspace-data";
import { ProcessingStatusLayout } from "./layouts";

function ProcessingLabel({ label }: { label: string }) {
  return (
    <span className="text-token-conversation-body">
      {label}
    </span>
  );
}

export function ProcessingStatus({
  label = workspaceData.conversation.processingLabel,
}: {
  label?: string;
}) {
  function Label() {
    return <ProcessingLabel label={label} />;
  }

  return <ProcessingStatusLayout slots={{ "processing-label": Label }} />;
}
