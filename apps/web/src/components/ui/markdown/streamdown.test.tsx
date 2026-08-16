import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import "@/i18n";

import { Streamdown } from "./streamdown";

describe("Streamdown", () => {
  it("renders semantic Markdown inside the app-owned style scope", () => {
    const markup = renderToStaticMarkup(
      <Streamdown
        content={`# Heading

Text with \`inline code\`.

> Quote

| Name | Status |
| --- | --- |
| Markdown | Ready |`}
        mode="static"
      />,
    );

    expect(markup).toContain("pi-markdown");
    expect(markup).toContain('data-streamdown="heading-1"');
    expect(markup).toContain('data-streamdown="inline-code"');
    expect(markup).toContain('data-streamdown="blockquote"');
    expect(markup).toContain('data-streamdown="table-wrapper"');
    expect(markup).toContain("lucide-copy");
    expect(markup).toContain("lucide-maximize");
    expect(markup).toContain("pi-streamdown-control-icon");
  });
});
