import assert from "node:assert/strict";
import test from "node:test";
import { JSDOM } from "jsdom";
import { renderToStaticMarkup } from "react-dom/server";
import { StaticMarkdown } from "../../src";
import { analyzeTableColumns, applyTableColumnSizes, isNumericCell, markdownTableToMarkdown, markdownTableToTSV } from "../../src/table";

test("analyzes numeric columns and content width", () => {
  assert.equal(isNumericCell("1,204.50"), true);
  assert.equal(isNumericCell("v2"), false);
  assert.deepEqual(analyzeTableColumns([["Name", "10"], ["Longer", "20.5"]]), [
    { index: 0, maxCharacters: 6, numeric: false, size: "sm" },
    { index: 1, maxCharacters: 4, numeric: true, size: "sm" },
  ]);
});

test("serializes table data without losing pipes", () => {
  const data = { headers: ["Name", "Value"], rows: [["A | B", "12"]] };
  assert.equal(markdownTableToMarkdown(data), "| Name | Value |\n| --- | --- |\n| A \\| B | 12 |");
  assert.equal(markdownTableToTSV(data), "Name\tValue\nA | B\t12");
});

test("writes static parity size attributes to table columns", () => {
  const document = new JSDOM("<table><tr><th>Name</th><th>Description</th></tr><tr><td>A</td><td>This is a deliberately long table value</td></tr></table>").window.document;
  const table = document.querySelector("table");
  assert.ok(table);
  applyTableColumnSizes(table);
  assert.equal(table.rows[0]?.cells[0]?.dataset.colSize, "sm");
  assert.equal(table.rows[0]?.cells[1]?.dataset.colSize, "lg");
});

test("renders package-owned table structure and actions", () => {
  const html = renderToStaticMarkup(
    <StaticMarkdown controls={{ table: { copy: true, fullscreen: true } }} preset="base">
      {"| Name | Value |\n| --- | ---: |\n| Alpha | 42 |"}
    </StaticMarkdown>,
  );

  assert.match(html, /class="smk-markdown-table-container"/);
  assert.match(html, /data-markdown-table="true"/);
  assert.match(html, /class="smk-markdown-table"/);
  assert.match(html, /class="smk-markdown-table-wrapper"/);
  assert.match(html, /data-markdown-node="table-header-cell"/);
  assert.match(html, /smk-markdown-table-cell--numeric/);
  assert.match(html, /aria-label="Expand table"/);
  assert.match(html, /aria-label="Copy table as Markdown"/);
});
