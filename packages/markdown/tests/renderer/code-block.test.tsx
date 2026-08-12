import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { StaticMarkdown, StreamingMarkdown } from "../../src";
import { getLanguageLabel, serializeCodeFence } from "../../src/code";

test("serializes safe Markdown fences", () => {
  assert.equal(serializeCodeFence("const ok = true;", "ts"), "```ts\nconst ok = true;\n```");
  assert.equal(serializeCodeFence("value = ```inside```", "txt"), "````txt\nvalue = ```inside```\n````");
});

test("normalizes common language labels", () => {
  assert.equal(getLanguageLabel("ts"), "TypeScript");
  assert.equal(getLanguageLabel("PY"), "Python");
  assert.equal(getLanguageLabel("custom"), "custom");
});

test("renders a package-owned code block around the upstream highlighter", () => {
  const html = renderToStaticMarkup(
    <StaticMarkdown controls={{ code: { copy: true } }} preset="base">
      {"```ts\nconst answer = 42;\n```"}
    </StaticMarkdown>,
  );

  assert.match(html, /class="smk-markdown-code-block"/);
  assert.match(html, /data-markdown-node="code-block"/);
  assert.match(html, /data-markdown-copy="code-block"/);
  assert.match(html, /data-language="ts"/);
  assert.match(html, /smk-markdown-code-language/);
  assert.match(html, />TypeScript</);
  assert.match(html, /aria-label="Copy code"/);
  assert.match(html, /const answer = 42;/);
});

test("renders a stable placeholder for an incomplete streaming fence", () => {
  const html = renderToStaticMarkup(
    <StreamingMarkdown isAnimating mode="streaming">
      {"```ts\nconst value = 1"}
    </StreamingMarkdown>,
  );

  assert.match(html, /class="smk-markdown-code-placeholder"/);
  assert.match(html, /data-incomplete="true"/);
  assert.match(html, /data-language="ts"/);
});
