import { selectSummaryOpen, useWorkspaceUi } from "../model";
import { SummaryPanelLayout } from "./layouts";
import { SummarySection } from "./summary-section";

export function SummaryPanel() {
  const summaryOpen = useWorkspaceUi(selectSummaryOpen);
  return (
    <SummaryPanelLayout open={summaryOpen}>
      <SummarySection />
    </SummaryPanelLayout>
  );
}
