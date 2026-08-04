import { Conversation } from "./conversation";
import { ThreadFooter } from "./thread-footer";
import { TimelineScrollLayout } from "./layouts";

export function TimelineScroll() {
  return (
    <TimelineScrollLayout
      slots={{
        conversation: Conversation,
        "thread-footer": ThreadFooter,
      }}
    />
  );
}
