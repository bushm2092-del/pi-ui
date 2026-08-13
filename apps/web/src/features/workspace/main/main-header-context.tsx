import { useConversation } from "../api";
import { SummaryToggle } from "../summary";
import { MainHeaderContextLayout } from "./layouts";

export function MainHeaderContext() {
  const { data: conversation } = useConversation();
  return (
    <MainHeaderContextLayout
      title={conversation?.title ?? "Pi 工作区"}
      summaryToggle={<SummaryToggle />}
    />
  );
}
