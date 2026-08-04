import { useWorkspaceState } from "../workspace-state";
import { SummaryPanelLayout, SummaryPanelOpenLayout } from "./layouts";
import { SummarySection } from "./summary-section";

export function SummaryPanel() {
  const { summaryOpen } = useWorkspaceState();
  const Layout = summaryOpen ? SummaryPanelOpenLayout : SummaryPanelLayout;
  return <Layout slots={{ "summary-section": SummarySection }} />;
}
