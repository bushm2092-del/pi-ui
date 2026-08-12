import { createElement, type ComponentProps, type ElementType } from "react";
import { joinClassNames } from "./shared";

export type MarkdownHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export function createMarkdownHeading(level: MarkdownHeadingLevel) {
  const tag = `h${level}` as ElementType;
  return function MarkdownHeading({ node: _, className, dir, ...props }: ComponentProps<"h1"> & { node?: unknown }) {
    return createElement(tag, {
      ...props,
      className: joinClassNames("smk-markdown-heading", `smk-markdown-heading--${level}`, className),
      dir: dir ?? "auto",
      "data-markdown-node": "heading",
      "data-markdown-level": level,
    });
  };
}
