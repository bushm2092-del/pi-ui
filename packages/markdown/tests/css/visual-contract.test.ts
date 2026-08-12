import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const stylesDirectory = new URL("../../src/styles/", import.meta.url);

async function style(name: string) {
  return readFile(new URL(name, stylesDirectory), "utf8");
}

test("locks the measured Codex typography and spacing contract", async () => {
  const [contract, content] = await Promise.all([
    style("contract.css"),
    style("content.css"),
  ]);

  assert.match(contract, /--smk-markdown-font-size:\s*13px/);
  assert.match(contract, /--smk-markdown-line-height:\s*21px/);
  assert.match(contract, /--smk-markdown-content-max-width:\s*40rem/);
  assert.match(content, /margin:\s*20px 0 10px/);
  assert.match(content, /padding-inline-start:\s*1\.3125rem/);
  assert.match(content, /padding-inline-start:\s*24px/);
  assert.match(content, /width:\s*4px/);
  assert.match(content, /margin:\s*0 6px 0 0/);
});

test("locks wide-block and control geometry", async () => {
  const [code, table, mermaid] = await Promise.all([
    style("code.css"),
    style("table.css"),
    style("mermaid.css"),
  ]);

  assert.match(code, /border-radius:\s*10px/);
  assert.match(code, /min-height:\s*28px/);
  assert.match(code, /width:\s*26px/);
  assert.match(table, /padding-bottom:\s*24px/);
  assert.match(table, /flex-direction:\s*column/);
  assert.match(mermaid, /inset-block-start:\s*8px/);
  assert.match(mermaid, /inset-inline-end:\s*8px/);
  assert.match(mermaid, /border-radius:\s*10px/);
});
