import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

export interface TableDialogProps {
  children: ReactNode;
  onClose: () => void;
  open: boolean;
}

export function TableDialog({ children, onClose, open }: TableDialogProps) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, open]);

  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div aria-label="Expanded table" aria-modal="true" className="smk-markdown smk-markdown-table-dialog" role="dialog">
      <button aria-label="Close expanded table" className="smk-markdown-table-dialog-close" onClick={onClose} title="Close" type="button">
        <X aria-hidden="true" size={18} />
      </button>
      <div className="smk-markdown-table-dialog-content">{children}</div>
    </div>,
    document.body,
  );
}
