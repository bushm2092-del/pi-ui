import { useLayoutEffect, useRef, type FormEvent, type KeyboardEvent } from "react";
import { shouldSubmitComposer } from "./composer-keyboard";

interface ComposerEditorProps {
  ariaLabel: string;
  draft: string;
  disabled?: boolean;
  onDraftChange: (draft: string) => void;
  onSubmit: () => void | Promise<void>;
}

export function ComposerEditor({
  ariaLabel,
  draft,
  disabled = false,
  onDraftChange,
  onSubmit,
}: ComposerEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const editor = editorRef.current;
    if (editor && editor.textContent !== draft) editor.textContent = draft;
  }, [draft]);

  function handleInput(event: FormEvent<HTMLDivElement>) {
    if (disabled) return;
    onDraftChange(event.currentTarget.textContent ?? "");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (disabled) return;
    if (
      !shouldSubmitComposer({
        key: event.key,
        shiftKey: event.shiftKey,
        isComposing: event.nativeEvent.isComposing,
      })
    ) {
      return;
    }
    event.preventDefault();
    void onSubmit();
  }

  return (
    <div
      ref={editorRef}
      contentEditable={!disabled}
      aria-disabled={disabled}
      aria-multiline="true"
      dir="auto"
      role="textbox"
      spellCheck
      translate="no"
      className="ProseMirror ProseMirror-focused"
      data-disabled={disabled || undefined}
      data-virtualkeyboard="true"
      style={{
        fontSize: "var(--codex-chat-font-size)",
        height: "auto",
        resize: "none",
        minHeight: "2.75rem",
      }}
      data-codex-composer="true"
      aria-label={ariaLabel}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      suppressContentEditableWarning
    />
  );
}
