import { workspaceData } from "../data/workspace-data";
import { SummaryToggle } from "../summary";
import { MainHeaderContextLayout } from "./layouts";

function MainHeaderTitle() {
  return (
    <button
      type="button"
      className="no-drag -ms-0.5 min-w-0 cursor-interaction truncate rounded-md px-1.5 text-left text-base leading-6 font-medium text-token-foreground hover:bg-token-list-hover-background focus-visible:bg-token-list-hover-background focus-visible:outline-none max-w-[320px]"
    >
      {workspaceData.conversation.title}
    </button>
  );
}

export function MainHeaderContext() {
  return (
    <MainHeaderContextLayout
      slots={{
        "main-header-title": MainHeaderTitle,
        "summary-toggle": SummaryToggle,
      }}
    />
  );
}
