import type { Components } from "streamdown";
import { MarkdownCode } from "../code/code-block";
import { MarkdownTable, MarkdownTableBody, MarkdownTableCell, MarkdownTableHead, MarkdownTableHeaderCell, MarkdownTableRow } from "../table/markdown-table";
import { MarkdownBlockquote } from "./blockquote";
import { createMarkdownHeading } from "./heading";
import { MarkdownHorizontalRule } from "./horizontal-rule";
import { MarkdownImage } from "./image";
import { MarkdownInlineCode } from "./inline-code";
import { MarkdownLink } from "./rich-link";
import { MarkdownListItem, MarkdownOrderedList, MarkdownTaskCheckbox, MarkdownUnorderedList } from "./list";
import { MarkdownParagraph } from "./paragraph";

export const markdownRenderers = {
  a: MarkdownLink,
  blockquote: MarkdownBlockquote,
  code: MarkdownCode,
  h1: createMarkdownHeading(1),
  h2: createMarkdownHeading(2),
  h3: createMarkdownHeading(3),
  h4: createMarkdownHeading(4),
  h5: createMarkdownHeading(5),
  h6: createMarkdownHeading(6),
  hr: MarkdownHorizontalRule,
  img: MarkdownImage,
  inlineCode: MarkdownInlineCode,
  input: MarkdownTaskCheckbox as Components["input"],
  li: MarkdownListItem,
  ol: MarkdownOrderedList,
  p: MarkdownParagraph,
  table: MarkdownTable,
  tbody: MarkdownTableBody,
  td: MarkdownTableCell,
  th: MarkdownTableHeaderCell,
  thead: MarkdownTableHead,
  tr: MarkdownTableRow,
  ul: MarkdownUnorderedList,
} satisfies Components;

export function createMarkdownRenderers(overrides: Components = {}): Components {
  return { ...markdownRenderers, ...overrides };
}
