import { useWorkspaceState } from "../workspace-state";
import { SummaryToggleLayout } from "./layouts";

export function SummaryToggle() {
  const { summaryOpen, toggleSummary } = useWorkspaceState();
  return (
    <SummaryToggleLayout
      rootProps={{
        "aria-pressed": summaryOpen,
        "aria-expanded": summaryOpen,
        "data-state": summaryOpen ? "open" : "closed",
        onClick: toggleSummary,
      }}
    />
  );
}
