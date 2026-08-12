import type { MermaidConfig } from "@streamdown/mermaid";

export const markdownMermaidConfig = {
  fontFamily: "ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
  securityLevel: "strict",
  startOnLoad: false,
  theme: "base",
  themeVariables: {
    background: "transparent",
    fontSize: "13px",
    lineColor: "#8a8a8a",
    primaryBorderColor: "#b8b8b8",
    primaryColor: "#f4f4f4",
    primaryTextColor: "#202124",
    secondaryColor: "#ffffff",
    tertiaryColor: "#eeeeee",
  },
} satisfies MermaidConfig;

export function mergeMermaidConfig(config?: MermaidConfig): MermaidConfig {
  return {
    ...markdownMermaidConfig,
    ...config,
    securityLevel: "strict",
    startOnLoad: false,
    themeVariables: {
      ...markdownMermaidConfig.themeVariables,
      ...config?.themeVariables,
    },
  };
}
