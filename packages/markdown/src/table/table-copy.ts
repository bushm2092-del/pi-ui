export interface MarkdownTableData {
  headers: string[];
  rows: string[][];
}

function cellText(cell: Element): string {
  return (cell.textContent ?? "").replace(/\s+/g, " ").trim();
}

export function extractMarkdownTable(table: HTMLTableElement): MarkdownTableData {
  const headers = Array.from(table.querySelectorAll("thead th"), cellText);
  const rows = Array.from(table.querySelectorAll("tbody tr"), (row) =>
    Array.from(row.querySelectorAll("td"), cellText),
  );
  return { headers, rows };
}

export function escapeMarkdownTableCell(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\|/g, "\\|").replace(/\r?\n/g, "<br>");
}

export function markdownTableToMarkdown({ headers, rows }: MarkdownTableData): string {
  const width = Math.max(headers.length, ...rows.map((row) => row.length));
  const normalizedHeaders = Array.from({ length: width }, (_, index) => headers[index] ?? "");
  const line = (cells: string[]) => `| ${Array.from({ length: width }, (_, index) => escapeMarkdownTableCell(cells[index] ?? "")).join(" | ")} |`;
  return [
    line(normalizedHeaders),
    line(Array.from({ length: width }, () => "---")),
    ...rows.map(line),
  ].join("\n");
}

export function markdownTableToTSV({ headers, rows }: MarkdownTableData): string {
  return [headers, ...rows].map((row) => row.join("\t")).join("\n");
}
