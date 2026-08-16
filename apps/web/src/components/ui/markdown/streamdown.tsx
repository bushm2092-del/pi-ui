import { createCodePlugin, type ThemeInput } from "@streamdown/code";
import { mermaid } from "@streamdown/mermaid";
import {
  CheckIcon,
  CopyIcon,
  DownloadIcon,
  ExternalLinkIcon,
  LoaderCircleIcon,
  MaximizeIcon,
  RotateCcwIcon,
  XIcon,
  ZoomInIcon,
  ZoomOutIcon,
  type LucideIcon,
} from "lucide-react";
import { useMemo, type SVGProps } from "react";
import { useTranslation } from "react-i18next";
import { Streamdown as StreamdownPrimitive, type IconMap, type StreamdownProps as StreamdownPrimitiveProps } from "streamdown";

import { cn } from "@/lib/utils";

const shikiThemes: [ThemeInput, ThemeInput] = ["one-light", "one-dark-pro"];
const plugins = { code: createCodePlugin({ themes: shikiThemes }), mermaid } as const;

type StreamdownIconProps = SVGProps<SVGSVGElement> & { size?: number };

function createStreamdownIcon(Icon: LucideIcon) {
  return function StreamdownIcon({ className, size = 14, ...props }: StreamdownIconProps) {
    return <Icon {...props} aria-hidden="true" className={cn("pi-streamdown-control-icon", className)} size={size} strokeWidth={1.5} />;
  };
}

const streamdownIcons = {
  CheckIcon: createStreamdownIcon(CheckIcon),
  CopyIcon: createStreamdownIcon(CopyIcon),
  DownloadIcon: createStreamdownIcon(DownloadIcon),
  ExternalLinkIcon: createStreamdownIcon(ExternalLinkIcon),
  Loader2Icon: createStreamdownIcon(LoaderCircleIcon),
  Maximize2Icon: createStreamdownIcon(MaximizeIcon),
  RotateCcwIcon: createStreamdownIcon(RotateCcwIcon),
  XIcon: createStreamdownIcon(XIcon),
  ZoomInIcon: createStreamdownIcon(ZoomInIcon),
  ZoomOutIcon: createStreamdownIcon(ZoomOutIcon),
} satisfies IconMap;

export interface StreamdownProps extends Omit<StreamdownPrimitiveProps, "children" | "plugins" | "shikiTheme"> {
  content: string;
}

/** Streaming Markdown configured for assistant output, code, and Mermaid diagrams. */
export function Streamdown({ content, className, isAnimating = false, ...props }: StreamdownProps) {
  const { t } = useTranslation();
  const translations = useMemo(
    () => ({
      close: t("markdown.controls.close"),
      copied: t("markdown.controls.copied"),
      copyCode: t("markdown.controls.copyCode"),
      copyLink: t("markdown.controls.copyLink"),
      copyTable: t("markdown.controls.copyTable"),
      downloadDiagram: t("markdown.controls.downloadDiagram"),
      downloadDiagramAsMmd: t("markdown.controls.downloadDiagramAsMmd"),
      downloadDiagramAsPng: t("markdown.controls.downloadDiagramAsPng"),
      downloadDiagramAsSvg: t("markdown.controls.downloadDiagramAsSvg"),
      exitFullscreen: t("markdown.controls.exitFullscreen"),
      externalLinkWarning: t("markdown.controls.externalLinkWarning"),
      openExternalLink: t("markdown.controls.openExternalLink"),
      openLink: t("markdown.controls.openLink"),
      viewFullscreen: t("markdown.controls.viewFullscreen"),
    }),
    [t],
  );

  return (
    <StreamdownPrimitive
      className={cn("pi-markdown min-w-0 text-token-text-primary", className)}
      controls={{
        code: { copy: true, download: false },
        mermaid: { copy: true, download: true, fullscreen: true, panZoom: true },
        table: { copy: true, download: false, fullscreen: true },
      }}
      dir="auto"
      icons={streamdownIcons}
      isAnimating={isAnimating}
      lineNumbers={false}
      linkSafety={{ enabled: true }}
      mermaid={{ config: { securityLevel: "strict", theme: "neutral" } }}
      parseIncompleteMarkdown
      plugins={plugins}
      shikiTheme={shikiThemes}
      skipHtml
      translations={translations}
      {...props}
    >
      {content}
    </StreamdownPrimitive>
  );
}
