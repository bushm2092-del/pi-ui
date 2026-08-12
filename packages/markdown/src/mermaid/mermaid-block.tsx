import { Check, Copy, Download, Maximize2, RotateCcw } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { DiagramPlugin } from "streamdown";
import { serializeCodeFence, writeClipboardText } from "../runtime/copy-serializer";
import { mergeMermaidConfig } from "./mermaid-theme";
import { MermaidDialog } from "./mermaid-dialog";

export interface MermaidBlockProps {
  chart: string;
  disabled?: boolean;
  isIncomplete?: boolean;
  plugin?: DiagramPlugin;
  showCopy?: boolean;
  showDownload?: boolean;
  showFullscreen?: boolean;
}

function downloadSource(chart: string) {
  const url = URL.createObjectURL(new Blob([chart], { type: "text/plain;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "diagram.mmd";
  anchor.click();
  URL.revokeObjectURL(url);
}

export function MermaidBlock({ chart, disabled, isIncomplete, plugin, showCopy = true, showDownload = true, showFullscreen = true }: MermaidBlockProps) {
  const instanceId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string>();
  const [revision, setRevision] = useState(0);
  const [svg, setSvg] = useState("");
  const copyTimer = useRef<number | undefined>(undefined);
  const copySource = useMemo(() => serializeCodeFence(chart, "mermaid"), [chart]);

  useEffect(() => () => window.clearTimeout(copyTimer.current), []);
  useEffect(() => {
    if (isIncomplete) {
      setSvg("");
      setError(undefined);
      return;
    }
    if (!plugin) {
      setError("Mermaid plugin is not available.");
      return;
    }
    let active = true;
    setError(undefined);
    plugin.getMermaid(mergeMermaidConfig()).render(`smk-mermaid-${instanceId}-${revision}`, chart)
      .then((result) => {
        if (active) setSvg(result.svg);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Unable to render diagram.");
      });
    return () => { active = false; };
  }, [chart, instanceId, isIncomplete, plugin, revision]);

  const copy = async () => {
    try {
      await writeClipboardText(chart);
      setCopied(true);
      window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };
  const diagram = svg ? <div aria-label="Mermaid diagram" className="smk-markdown-mermaid-svg" dangerouslySetInnerHTML={{ __html: svg }} role="img" /> : null;

  return (
    <div className="smk-markdown-mermaid" data-incomplete={isIncomplete || undefined} data-markdown-copy="code-block" data-markdown-copy-text={copySource} data-markdown-node="mermaid">
      <div className="smk-markdown-mermaid-toolbar" data-markdown-copy="exclude">
        <div className="smk-markdown-mermaid-actions">
          {showFullscreen ? <button aria-label="Expand Mermaid diagram" disabled={disabled || isIncomplete} onClick={() => setExpanded(true)} title="Expand diagram" type="button"><Maximize2 aria-hidden="true" size={15} /></button> : null}
          {showDownload ? <button aria-label="Download Mermaid source" disabled={disabled || isIncomplete} onClick={() => downloadSource(chart)} title="Download source" type="button"><Download aria-hidden="true" size={15} /></button> : null}
          {showCopy ? <button aria-label={copied ? "Copied" : "Copy Mermaid source"} disabled={disabled || isIncomplete} onClick={copy} title={copied ? "Copied" : "Copy source"} type="button">{copied ? <Check aria-hidden="true" size={15} /> : <Copy aria-hidden="true" size={15} />}</button> : null}
        </div>
      </div>
      <div className="smk-markdown-mermaid-surface">
        {isIncomplete ? <div className="smk-markdown-mermaid-placeholder">Waiting for the diagram to complete...</div> : null}
        {!isIncomplete && !svg && !error ? <div className="smk-markdown-mermaid-placeholder">Rendering diagram...</div> : null}
        {error ? <div className="smk-markdown-mermaid-error" role="alert"><span>{error}</span><button aria-label="Retry Mermaid diagram" onClick={() => setRevision((value) => value + 1)} title="Retry" type="button"><RotateCcw aria-hidden="true" size={15} /></button></div> : null}
        {diagram}
      </div>
      <MermaidDialog onClose={() => setExpanded(false)} open={expanded}>{diagram}</MermaidDialog>
    </div>
  );
}
