import type { PluginConfig, StreamdownProps } from "streamdown";
import { cjk } from "@streamdown/cjk";
import { markdownCode } from "../code/code-plugin";
import { markdownMath } from "../math/math-plugin";
import { markdownMermaid } from "../mermaid/mermaid-plugin";
import { markdownRenderers } from "../renderers/create-renderers";
import type { MarkdownPreset } from "../types";
import { markdownUrlTransform } from "./url-policy";

export const markdownPlugins = {
  cjk,
  code: markdownCode,
  math: markdownMath,
  mermaid: markdownMermaid,
} satisfies PluginConfig;

export const basePreset = {
  animated: {
    animation: "fadeIn",
    duration: 140,
    easing: "ease-out",
    sep: "word",
    stagger: 12,
  },
  controls: true,
  components: markdownRenderers,
  dir: "auto",
  linkSafety: { enabled: true },
  parseIncompleteMarkdown: true,
  urlTransform: markdownUrlTransform,
} satisfies StreamdownProps;

export const fullPreset = {
  ...basePreset,
  plugins: markdownPlugins,
} satisfies StreamdownProps;

export function getMarkdownPreset(
  preset: MarkdownPreset = "full",
): StreamdownProps {
  if (preset === false) return {};
  return preset === "base" ? basePreset : fullPreset;
}
