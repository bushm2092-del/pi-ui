import { createElement, isValidElement, useContext, useState, type ComponentProps, type ReactNode } from "react";
import { CodeBlock, StreamdownContext, useIsCodeFenceIncomplete, type StreamdownContextType } from "streamdown";
import { MermaidBlock } from "../mermaid/mermaid-block";
import { serializeCodeFence } from "../runtime/copy-serializer";
import { useMarkdownRuntime } from "../runtime/markdown-runtime-context";
import { joinClassNames } from "../renderers/shared";
import { CodeToolbar } from "./code-toolbar";
import { CodePlaceholder } from "./code-placeholder";

const LANGUAGE_PATTERN = /(?:lang|language)-([^\s]+)/;

function extractCode(children: ReactNode): string {
  if (typeof children === "string") return children;
  if (isValidElement<{ children?: ReactNode }>(children)) return extractCode(children.props.children);
  if (Array.isArray(children)) return children.map(extractCode).join("");
  return "";
}

function codeControlsEnabled(context: StreamdownContextType) {
  if (context.controls === false) return false;
  if (typeof context.controls !== "object") return true;
  const code = context.controls.code;
  if (code === false) return false;
  return typeof code === "object" ? code.copy !== false : true;
}

function mermaidControl(context: StreamdownContextType, control: "copy" | "download" | "fullscreen") {
  if (context.controls === false) return false;
  if (typeof context.controls !== "object") return true;
  const mermaid = context.controls.mermaid;
  if (mermaid === false) return false;
  return typeof mermaid === "object" ? mermaid[control] !== false : true;
}

function nodeMeta(node: unknown): string | undefined {
  if (!node || typeof node !== "object" || !("properties" in node)) return undefined;
  const properties = (node as { properties?: unknown }).properties;
  if (!properties || typeof properties !== "object" || !("metastring" in properties)) return undefined;
  const value = (properties as { metastring?: unknown }).metastring;
  return typeof value === "string" ? value : undefined;
}

function MarkdownCodeBlock({ children, className, node }: Pick<ComponentProps<"code">, "children" | "className"> & { node?: unknown }) {
  const context = useContext(StreamdownContext);
  const runtime = useMarkdownRuntime();
  const isIncomplete = useIsCodeFenceIncomplete();
  const [wrapped, setWrapped] = useState(false);
  const language = className?.match(LANGUAGE_PATTERN)?.[1] ?? "";
  const code = extractCode(children).replace(/\n$/, "");
  const customRenderer = language
    ? runtime.plugins?.renderers?.find((renderer) => Array.isArray(renderer.language) ? renderer.language.includes(language) : renderer.language === language)
    : undefined;

  if (customRenderer) {
    return createElement(customRenderer.component, { code, isIncomplete, language, meta: nodeMeta(node) });
  }

  if (language === (runtime.plugins?.mermaid?.language ?? "mermaid") && runtime.plugins?.mermaid) {
    return (
      <MermaidBlock
        chart={code}
        disabled={context.isAnimating}
        isIncomplete={isIncomplete}
        plugin={runtime.plugins.mermaid}
        showCopy={mermaidControl(context, "copy")}
        showDownload={mermaidControl(context, "download")}
        showFullscreen={mermaidControl(context, "fullscreen")}
      />
    );
  }

  if (isIncomplete) {
    return <CodePlaceholder code={code} language={language} />;
  }

  return (
    <div
      className={joinClassNames("smk-markdown-code-block", wrapped ? "smk-markdown-code-block--wrapped" : undefined)}
      data-incomplete={isIncomplete || undefined}
      data-language={language}
      data-markdown-copy="code-block"
      data-markdown-copy-text={serializeCodeFence(code, language)}
      data-markdown-node="code-block"
    >
      <CodeBlock code={code} isIncomplete={isIncomplete} language={language} lineNumbers={context.lineNumbers}>
        <CodeToolbar
          code={code}
          copyEnabled={codeControlsEnabled(context)}
          disabled={context.isAnimating}
          language={language}
          onWrapChange={setWrapped}
          wrapped={wrapped}
        />
      </CodeBlock>
    </div>
  );
}

export function MarkdownCode({ node: _, children, className, ...props }: ComponentProps<"code"> & { node?: unknown }) {
  if ("data-block" in props) {
    return <MarkdownCodeBlock className={className} node={_}>{children}</MarkdownCodeBlock>;
  }

  return <code className={joinClassNames("smk-markdown-inline-code", className)} data-markdown-copy="inline-code" data-markdown-node="inline-code" {...props}>{children}</code>;
}
