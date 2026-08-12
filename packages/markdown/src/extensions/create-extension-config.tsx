import type { ComponentType } from "react";
import type { Components, StreamdownProps } from "streamdown";
import { Citation, type CitationProps } from "./citation";
import { FileReference, type FileReferenceProps } from "./file-reference";
import { MediaGrid } from "./media-grid";
import { Visualization, type VisualizationProps } from "./visualization";

export interface MarkdownExtensionComponents {
  citation?: ComponentType<CitationProps>;
  fileReference?: ComponentType<FileReferenceProps>;
  mediaGrid?: ComponentType<Record<string, unknown>>;
  visualization?: ComponentType<VisualizationProps>;
}

export function createMarkdownExtensionConfig(extensions: MarkdownExtensionComponents = {}): StreamdownProps {
  const components = {
    "smk-citation": extensions.citation ?? Citation,
    "smk-file": extensions.fileReference ?? FileReference,
    "smk-media-grid": extensions.mediaGrid ?? MediaGrid,
    "smk-visualization": extensions.visualization ?? Visualization,
  } as Components;

  return {
    allowedTags: {
      "smk-citation": ["source"],
      "smk-file": ["path", "line"],
      "smk-media-grid": [],
      "smk-visualization": ["kind"],
    },
    components,
  };
}
