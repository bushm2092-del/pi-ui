import type { CodePluginOptions } from "@streamdown/code";
import type { CodeHighlighterPlugin, HighlightOptions, ThemeInput } from "streamdown";

const DEFAULT_THEMES: [ThemeInput, ThemeInput] = ["github-light", "github-dark"];

export function createMarkdownCodePlugin(options: CodePluginOptions = {}): CodeHighlighterPlugin {
  const themes = options.themes ?? DEFAULT_THEMES;
  let loaded: CodeHighlighterPlugin | undefined;
  let loading: Promise<CodeHighlighterPlugin> | undefined;
  const load = () => {
    loading ??= import("@streamdown/code").then(({ createCodePlugin }) => {
      loaded = createCodePlugin(options);
      return loaded;
    });
    return loading;
  };

  return {
    getSupportedLanguages: () => loaded?.getSupportedLanguages() ?? [],
    getThemes: () => themes,
    highlight(highlightOptions: HighlightOptions, callback) {
      if (loaded) return loaded.highlight(highlightOptions, callback);
      void load().then((plugin) => {
        const result = plugin.highlight(highlightOptions, callback);
        if (result) callback?.(result);
      });
      return null;
    },
    name: "shiki",
    supportsLanguage: (language) => loaded?.supportsLanguage(language) ?? Boolean(language),
    type: "code-highlighter",
  };
}

export const markdownCode = createMarkdownCodePlugin();
