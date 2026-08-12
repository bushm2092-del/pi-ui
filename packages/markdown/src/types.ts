import type { StreamdownProps } from "streamdown";
import type { MarkdownExtensionComponents } from "./extensions/create-extension-config";

export type MarkdownPreset = "full" | "base" | false;
export type MarkdownAppearance = "default" | "compact";

export interface StreamingMarkdownProps extends StreamdownProps {
  preset?: MarkdownPreset;
  appearance?: MarkdownAppearance;
  extensions?: MarkdownExtensionComponents;
}

export type StaticMarkdownProps = Omit<
  StreamingMarkdownProps,
  "isAnimating" | "mode"
>;
