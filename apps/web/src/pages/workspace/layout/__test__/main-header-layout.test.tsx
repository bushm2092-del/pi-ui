import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MainHeaderLayout } from "../components/main/layouts";

describe("MainHeaderLayout", () => {
  it("reserves the sidebar width and exposes the close action when open", () => {
    const markup = renderToStaticMarkup(
      <MainHeaderLayout sidebarOpen onToggleSidebar={() => undefined}>
        context
      </MainHeaderLayout>,
    );

    expect(markup).toContain("aria-label=\"隐藏边栏\"");
    expect(markup).toContain("width:240px");
    expect(markup).toContain("min-width:180px");
  });

  it("keeps a compact restore action when the sidebar is closed", () => {
    const markup = renderToStaticMarkup(
      <MainHeaderLayout sidebarOpen={false} onToggleSidebar={() => undefined}>
        context
      </MainHeaderLayout>,
    );

    expect(markup).toContain("aria-label=\"显示边栏\"");
    expect(markup).toContain("aria-pressed=\"true\"");
    expect(markup).toContain("width:124px");
    expect(markup).toContain("min-width:124px");
  });
});
