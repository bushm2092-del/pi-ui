import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { StaticMarkdown } from "../../src";
import { mergeMermaidConfig } from "../../src/mermaid";

test("locks Mermaid to strict runtime security", () => {
  const config = mergeMermaidConfig({ securityLevel: "loose", startOnLoad: true });
  assert.equal(config.securityLevel, "strict");
  assert.equal(config.startOnLoad, false);
  assert.equal(config.theme, "base");
});

test("renders package-owned Mermaid shell before client rendering", () => {
  const html = renderToStaticMarkup(
    <StaticMarkdown preset="full">{"```mermaid\ngraph TD\n  A --> B\n```"}</StaticMarkdown>,
  );
  assert.match(html, /class="smk-markdown-mermaid"/);
  assert.match(html, /data-markdown-node="mermaid"/);
  assert.match(html, /aria-label="Expand Mermaid diagram"/);
  assert.match(html, /aria-label="Download Mermaid source"/);
  assert.match(html, /aria-label="Copy Mermaid source"/);
  assert.match(html, /Rendering diagram/);
  assert.doesNotMatch(html, /smk-markdown-mermaid-svg/);
});

test("preserves Streamdown custom renderer dispatch", () => {
  function CustomRenderer({ code, language, meta }: { code: string; language: string; meta?: string }) {
    return <div data-code={code} data-language={language} data-meta={meta}>custom output</div>;
  }
  const html = renderToStaticMarkup(
    <StaticMarkdown
      plugins={{ renderers: [{ component: CustomRenderer, language: "artifact" }] }}
      preset="base"
    >
      {'```artifact title="demo"\nhello\n```'}
    </StaticMarkdown>,
  );
  assert.match(html, /data-language="artifact"/);
  assert.match(html, /data-meta="title=&quot;demo&quot;"/);
  assert.match(html, /data-code="hello"/);
  assert.match(html, />custom output</);
});
