import type { ComponentProps } from "react";
import { joinClassNames } from "./shared";

export function MarkdownOrderedList({ node: _, className, dir, ...props }: ComponentProps<"ol"> & { node?: unknown }) {
  return <ol className={joinClassNames("smk-markdown-text", "smk-markdown-list", "smk-markdown-list--ordered", className)} data-markdown-node="ordered-list" dir={dir ?? "auto"} {...props} />;
}

export function MarkdownUnorderedList({ node: _, className, dir, ...props }: ComponentProps<"ul"> & { node?: unknown }) {
  return <ul className={joinClassNames("smk-markdown-text", "smk-markdown-list", "smk-markdown-list--unordered", className)} data-markdown-node="unordered-list" dir={dir ?? "auto"} {...props} />;
}

export function MarkdownListItem({ node: _, className, ...props }: ComponentProps<"li"> & { node?: unknown }) {
  return <li className={joinClassNames("smk-markdown-text", "smk-markdown-list-item", className)} data-markdown-node="list-item" {...props} />;
}

export function MarkdownTaskCheckbox({ checked, className, ...props }: ComponentProps<"input">) {
  if (props.type !== "checkbox") return <input checked={checked} className={className} {...props} />;

  return (
    <button
      aria-checked={Boolean(checked)}
      className={joinClassNames("smk-markdown-task-checkbox", className)}
      data-state={checked ? "checked" : "unchecked"}
      disabled
      role="checkbox"
      tabIndex={-1}
      type="button"
    />
  );
}
