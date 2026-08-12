import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { StaticMarkdown } from "../../src";

const fixture = `# Heading

A [safe link](https://example.com) with \`inline code\`.

- first item
- [x] completed task

> quoted text

---
`;

test("base preset renders package-owned semantic nodes", () => {
  const html = renderToStaticMarkup(
    <StaticMarkdown preset="base">{fixture}</StaticMarkdown>,
  );

  assert.match(html, /class="[^"]*smk-markdown[^"]*"/);
  assert.match(html, /class="[^"]*smk-markdown--default[^"]*"/);
  assert.match(html, /dir="auto"/);
  assert.match(html, /data-markdown-node="heading"/);
  assert.match(html, /data-markdown-node="paragraph"/);
  assert.match(html, /data-markdown-node="unordered-list"/);
  assert.match(html, /class="smk-markdown-task-checkbox"/);
  assert.match(html, /role="checkbox"/);
  assert.match(html, /aria-checked="true"/);
  assert.match(html, /data-markdown-copy="inline-code"/);
  assert.match(html, /target="_blank"/);
  assert.match(html, /rel="noopener noreferrer"/);
  assert.match(html, /class="smk-markdown-link-content"/);
  assert.match(html, /class="smk-markdown-link-icon-fallback"/);
  assert.match(html, /viewBox="0 0 20 20"/);
  assert.match(html, /src="https:\/\/example\.com\/favicon\.ico"/);
  assert.match(html, /smk-markdown-text smk-markdown-blockquote/);
  assert.match(html, /data-markdown-node="blockquote"/);
  assert.match(html, /data-markdown-node="horizontal-rule"/);
});

test("consumer renderer overrides win over the preset", () => {
  const html = renderToStaticMarkup(
    <StaticMarkdown
      components={{ p: ({ children }) => <p data-consumer="true">{children}</p> }}
      preset="base"
    >
      paragraph
    </StaticMarkdown>,
  );

  assert.match(html, /data-consumer="true"/);
  assert.doesNotMatch(html, /data-markdown-node="paragraph"/);
});
