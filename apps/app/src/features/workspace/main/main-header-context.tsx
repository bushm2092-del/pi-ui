import { workspaceData } from "../data/workspace-data";
import { SummaryToggle } from "../summary";
import { MainHeaderContextLayout } from "./layouts";

export function MainHeaderContext() {
  return (
    <MainHeaderContextLayout
      title={workspaceData.conversation.title}
      summaryToggle={<SummaryToggle />}
    />
  );
}
