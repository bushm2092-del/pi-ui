import type { DiagramPlugin, MermaidConfig, MermaidInstance, MermaidPluginOptions } from "@streamdown/mermaid";
import { mergeMermaidConfig } from "./mermaid-theme";

let mermaidModule: Promise<typeof import("mermaid")> | undefined;

function loadMermaid() {
  mermaidModule ??= import("mermaid");
  return mermaidModule;
}

export function createMarkdownMermaidPlugin(options: MermaidPluginOptions = {}): DiagramPlugin {
  let config = mergeMermaidConfig(options.config);
  const instance: MermaidInstance = {
    initialize(next: MermaidConfig) {
      config = mergeMermaidConfig({ ...config, ...next });
    },
    async render(id, source) {
      const loaded = await loadMermaid();
      loaded.default.initialize(config);
      return loaded.default.render(id, source);
    },
  };

  return {
    getMermaid(next) {
      if (next) instance.initialize(next);
      return instance;
    },
    language: "mermaid",
    name: "mermaid",
    type: "diagram",
  };
}

export const markdownMermaid = createMarkdownMermaidPlugin();
