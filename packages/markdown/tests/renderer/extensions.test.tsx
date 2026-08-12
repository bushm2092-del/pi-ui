import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { StaticMarkdown, type FileReferenceProps } from "../../src";

const fixture = `References <smk-file path="src/app.tsx" line="42">app.tsx</smk-file> <smk-citation source="7">7</smk-citation>.

<smk-media-grid><img src="https://example.com/a.png" alt="A"><img src="https://example.com/b.png" alt="B"></smk-media-grid>

<smk-visualization kind="timeline">Timeline content</smk-visualization>`;

test("renders package extension tags through the sanitizer", () => {
  const html = renderToStaticMarkup(<StaticMarkdown preset="base">{fixture}</StaticMarkdown>);
  assert.match(html, /class="smk-markdown-file-reference"/);
  assert.match(html, /data-path="src\/app.tsx"/);
  assert.match(html, /data-line="42"/);
  assert.match(html, /class="smk-markdown-citation"/);
  assert.match(html, /data-source="7"/);
  assert.match(html, /class="smk-markdown-media-grid"/);
  assert.match(html, /class="smk-markdown-visualization"/);
  assert.match(html, /data-kind="timeline"/);
  assert.doesNotMatch(html, /\snode=/);
});

test("allows host applications to replace extension renderers", () => {
  function HostFile({ children, path }: FileReferenceProps) {
    return <a data-host-file={path} href={`/files/${path}`}>{children}</a>;
  }
  const html = renderToStaticMarkup(
    <StaticMarkdown extensions={{ fileReference: HostFile }} preset="base">
      {'<smk-file path="README.md">readme</smk-file>'}
    </StaticMarkdown>,
  );
  assert.match(html, /data-host-file="README.md"/);
  assert.match(html, /href="\/files\/README.md"/);
  assert.doesNotMatch(html, /smk-markdown-file-reference/);
});
