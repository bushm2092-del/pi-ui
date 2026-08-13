import { SummaryPanel } from "../summary";
import { ThreadFrameLayout } from "./layouts";
import { TimelineScroll } from "./timeline-scroll";

export function ThreadFrame() {
  return (
    <ThreadFrameLayout
      timeline={<TimelineScroll />}
      summary={<SummaryPanel />}
    />
  );
}
