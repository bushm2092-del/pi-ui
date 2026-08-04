import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SummaryPanelLayout } from "./summary-panel-layout";
import { SummarySectionLayout } from "./summary-section-layout";

describe("summary layouts", () => {
  it("uses one panel structure for closed and open states", () => {
    const closed = renderToStaticMarkup(
      <SummaryPanelLayout open={false}>content</SummaryPanelLayout>,
    );
    const open = renderToStaticMarkup(
      <SummaryPanelLayout open>content</SummaryPanelLayout>,
    );

    expect(closed).toContain("opacity:0");
    expect(closed).toContain("translateX(100%) scale(0.8)");
    expect(closed).toContain("pointer-events-none");
    expect(open).toContain("opacity:1");
    expect(open).toContain("transform:none");
    expect(open).toContain("pointer-events-auto");
  });

  it("renders summary labels from props", () => {
    const markup = renderToStaticMarkup(
      <SummarySectionLayout sectionLabel="Result" actionLabel="Create file" />,
    );

    expect(markup).toContain("Result");
    expect(markup).toContain("Create file");
  });
});
