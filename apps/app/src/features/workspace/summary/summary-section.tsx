import { workspaceData } from "../data/workspace-data";
import { SummarySectionLayout } from "./layouts";

function SectionLabel() {
  return (
    <span className="truncate">
      {workspaceData.conversation.summary.sectionLabel}
    </span>
  );
}

function ActionLabel() {
  return (
    <span
      className="min-w-0 flex-1 text-base text-fade-truncate"
      data-slot="thread-summary-panel-item-label"
    >
      {workspaceData.conversation.summary.actionLabel}
    </span>
  );
}

export function SummarySection() {
  return (
    <SummarySectionLayout
      slots={{
        "summary-section-label": SectionLabel,
        "summary-action-label": ActionLabel,
      }}
    />
  );
}
