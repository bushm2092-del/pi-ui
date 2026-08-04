import {
  selectSummaryOpen,
  selectToggleSummary,
  useWorkspaceUi,
} from "../model";
import { SummaryToggleLayout } from "./layouts";

export function SummaryToggle() {
  const summaryOpen = useWorkspaceUi(selectSummaryOpen);
  const toggleSummary = useWorkspaceUi(selectToggleSummary);
  return (
    <SummaryToggleLayout
      open={summaryOpen}
      onClick={toggleSummary}
    />
  );
}
