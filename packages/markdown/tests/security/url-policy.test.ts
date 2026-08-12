import assert from "node:assert/strict";
import test from "node:test";
import { isExternalMarkdownUrl, isSafeMarkdownUrl, markdownUrlTransform } from "../../src/runtime/url-policy";

test("allows navigable web, application, and relative URLs", () => {
  for (const url of ["https://example.com", "http://example.com", "mailto:test@example.com", "tel:+123", "/docs", "../asset", "#section"]) {
    assert.equal(isSafeMarkdownUrl(url), true, url);
    assert.equal(markdownUrlTransform(url, "href", {} as never), url);
  }
});

test("rejects scriptable and malformed explicit protocols", () => {
  for (const url of ["javascript:alert(1)", "data:text/html,<script></script>", "vbscript:msgbox(1)", "https://["]) {
    assert.equal(isSafeMarkdownUrl(url), false, url);
    assert.equal(markdownUrlTransform(url, "href", {} as never), null);
  }
});

test("classifies only absolute HTTP URLs as external", () => {
  assert.equal(isExternalMarkdownUrl("https://example.com"), true);
  assert.equal(isExternalMarkdownUrl("/docs"), false);
  assert.equal(isExternalMarkdownUrl("mailto:test@example.com"), false);
});
