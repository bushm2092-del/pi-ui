import { Streamdown } from "streamdown";
import { getMarkdownPreset } from "./runtime/preset";
import { mergeStreamdownProps } from "./runtime/merge-streamdown-props";
import { MarkdownRuntimeProvider } from "./runtime/markdown-runtime-context";
import type { StreamingMarkdownProps } from "./types";
import { createMarkdownExtensionConfig } from "./extensions/create-extension-config";

function joinClassNames(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function StreamingMarkdown({
  preset = "full",
  appearance = "default",
  className,
  extensions,
  ...props
}: StreamingMarkdownProps) {
  const withExtensions = mergeStreamdownProps(
    getMarkdownPreset(preset),
    createMarkdownExtensionConfig(extensions),
  );
  const merged = mergeStreamdownProps(withExtensions, props);

  return (
    <MarkdownRuntimeProvider plugins={merged.plugins}>
      <Streamdown
        {...merged}
        dir={merged.dir ?? "auto"}
        className={joinClassNames(
          "smk-markdown",
          `smk-markdown--${appearance}`,
          className,
        )}
      />
    </MarkdownRuntimeProvider>
  );
}
