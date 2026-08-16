import { workspaceData } from "../data/workspace-data";
import { SummarySectionLayout } from "./layouts";

export function SummarySection() {
  return (
    <SummarySectionLayout
      sectionLabel={workspaceData.conversation.summary.sectionLabel}
      actionLabel={workspaceData.conversation.summary.actionLabel}
    />
  );
}
