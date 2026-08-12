import { Check, Copy, Maximize2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { writeClipboardText } from "../runtime/copy-serializer";

export interface TableActionsProps {
  copyText: () => string;
  disabled?: boolean;
  onExpand: () => void;
  showCopy?: boolean;
  showExpand?: boolean;
}

export function TableActions({ copyText, disabled, onExpand, showCopy = true, showExpand = true }: TableActionsProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await writeClipboardText(copyText());
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="smk-markdown-table-actions" data-markdown-copy="exclude">
      {showExpand ? (
        <button aria-label="Expand table" disabled={disabled} onClick={onExpand} title="Expand table" type="button">
          <Maximize2 aria-hidden="true" size={15} />
        </button>
      ) : null}
      {showCopy ? (
        <button aria-label={copied ? "Copied" : "Copy table as Markdown"} disabled={disabled} onClick={copy} title={copied ? "Copied" : "Copy table"} type="button">
          {copied ? <Check aria-hidden="true" size={15} /> : <Copy aria-hidden="true" size={15} />}
        </button>
      ) : null}
    </div>
  );
}
