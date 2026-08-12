import assert from "node:assert/strict";
import test from "node:test";
import { JSDOM } from "jsdom";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { DiagramPlugin, MermaidConfig } from "@streamdown/mermaid";
import { MermaidBlock } from "../../src/mermaid";

test("renders Mermaid asynchronously with strict configuration", async () => {
  const dom = new JSDOM("<!doctype html><div id=\"root\"></div>", { url: "https://example.test" });
  Object.assign(globalThis, {
    IS_REACT_ACT_ENVIRONMENT: true,
    document: dom.window.document,
    HTMLElement: dom.window.HTMLElement,
    Node: dom.window.Node,
    window: dom.window,
  });
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: dom.window.navigator });

  let receivedConfig: MermaidConfig | undefined;
  const plugin: DiagramPlugin = {
    getMermaid(config) {
      receivedConfig = config;
      return {
        initialize() {},
        async render() {
          return { svg: '<svg viewBox="0 0 10 10"><text>diagram ready</text></svg>' };
        },
      };
    },
    language: "mermaid",
    name: "mermaid",
    type: "diagram",
  };

  const container = dom.window.document.getElementById("root")!;
  const root = createRoot(container);
  await act(async () => {
    root.render(<MermaidBlock chart="graph TD; A-->B" plugin={plugin} />);
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  assert.equal(receivedConfig?.securityLevel, "strict");
  assert.match(container.innerHTML, /smk-markdown-mermaid-svg/);
  assert.match(container.innerHTML, /diagram ready/);
  assert.doesNotMatch(container.innerHTML, /Rendering diagram/);

  await act(async () => root.unmount());
  dom.window.close();
});
