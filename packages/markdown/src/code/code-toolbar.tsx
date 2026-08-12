import { Check, Copy, WrapText } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { writeClipboardText } from "../runtime/copy-serializer";
import { getLanguageLabel } from "./language-label";

export interface CodeToolbarProps {
  code: string;
  copyEnabled?: boolean;
  disabled?: boolean;
  language: string;
  onWrapChange: (wrapped: boolean) => void;
  wrapped: boolean;
}

export function CodeToolbar({ code, copyEnabled = true, disabled, language, onWrapChange, wrapped }: CodeToolbarProps) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<number | undefined>(undefined);
  const canWrap = code.split("\n").some((line) => line.length > 80);

  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  const copy = async () => {
    try {
      await writeClipboardText(code);
      setCopied(true);
      window.clearTimeout(resetTimer.current);
      resetTimer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <span className="smk-markdown-code-language" data-markdown-copy="exclude">
        {getLanguageLabel(language)}
      </span>
      <span className="smk-markdown-code-actions" data-markdown-copy="exclude">
        {canWrap ? (
          <button
            aria-label={wrapped ? "Disable code wrapping" : "Enable code wrapping"}
            aria-pressed={wrapped}
            disabled={disabled}
            onClick={() => onWrapChange(!wrapped)}
            title={wrapped ? "Disable wrapping" : "Enable wrapping"}
            type="button"
          >
            <WrapText aria-hidden="true" size={15} />
          </button>
        ) : null}
        {copyEnabled ? (
          <button aria-label={copied ? "Copied" : "Copy code"} disabled={disabled} onClick={copy} title={copied ? "Copied" : "Copy code"} type="button">
            {copied ? <Check aria-hidden="true" size={15} /> : <Copy aria-hidden="true" size={15} />}
          </button>
        ) : null}
      </span>
    </>
  );
}
