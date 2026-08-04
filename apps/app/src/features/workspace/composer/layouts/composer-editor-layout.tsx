import type { LayoutProps } from "../../layout";

export function ComposerEditorLayout({ slots = {}, rootProps = {} }: LayoutProps = {}) {
  return (
    <div {...({"contentEditable":"true","aria-multiline":"true","dir":"auto","role":"textbox","spellCheck":"true","translate":"no","className":"ProseMirror ProseMirror-focused","data-virtualkeyboard":"true","style":{"fontSize":"var(--codex-chat-font-size)","height":"auto","resize":"none","minHeight":"2.75rem"},"data-codex-composer":"true","aria-label":"随心输入"} as any)} {...rootProps}>
      <p>
        {"可以先这么搭建一个架构出来"}
      </p>
    </div>
  );
}
