import { createMathPlugin, type MathPluginOptions } from "@streamdown/math";

export const markdownMathOptions = {
  errorColor: "var(--smk-markdown-text-secondary)",
  singleDollarTextMath: false,
} satisfies MathPluginOptions;

export function createMarkdownMathPlugin(options: MathPluginOptions = {}) {
  return createMathPlugin({ ...markdownMathOptions, ...options });
}

export const markdownMath = createMarkdownMathPlugin();
