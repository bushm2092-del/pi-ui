import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { MathRenderer, StaticMarkdown } from "../../src";

test("renders accessible KaTeX with the package copy contract", () => {
  const html = renderToStaticMarkup(<MathRenderer display source="E = mc^2" />);
  assert.match(html, /smk-markdown-math--display/);
  assert.match(html, /data-markdown-copy="math"/);
  assert.match(html, /data-markdown-copy-text="\$\$/);
  assert.match(html, /class="katex"/);
  assert.match(html, /<math/);
  assert.match(html, /E/);
});

test("full preset parses inline and display math", () => {
  const html = renderToStaticMarkup(
    <StaticMarkdown preset="full">{"Inline \\(x^2\\) expression.\n\n$$\n\\sum_{i=1}^n i\n$$"}</StaticMarkdown>,
  );
  assert.match(html, /class="katex"/);
  assert.match(html, /class="katex-display"/);
  assert.match(html, /<math/);
});
