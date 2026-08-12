export function isNumericCell(value: string): boolean {
  const normalized = value.trim().replace(/[,%\s]/g, "");
  return normalized !== "" && /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(normalized);
}

export interface ColumnAnalysis {
  index: number;
  maxCharacters: number;
  numeric: boolean;
  size: ColumnSize;
}

export type ColumnSize = "sm" | "md" | "lg" | "xl";

export function getColumnSize(maxCharacters: number): ColumnSize {
  if (maxCharacters <= 12) return "sm";
  if (maxCharacters <= 24) return "md";
  if (maxCharacters <= 48) return "lg";
  return "xl";
}

export function analyzeTableColumns(rows: string[][]): ColumnAnalysis[] {
  const width = Math.max(0, ...rows.map((row) => row.length));
  return Array.from({ length: width }, (_, index) => {
    const values = rows.map((row) => row[index] ?? "").filter((value) => value.trim() !== "");
    const maxCharacters = Math.max(0, ...values.map((value) => value.length));
    return {
      index,
      maxCharacters,
      numeric: values.length > 0 && values.every(isNumericCell),
      size: getColumnSize(maxCharacters),
    };
  });
}

export function applyTableColumnSizes(table: HTMLTableElement): void {
  const rows = Array.from(table.rows, (row) =>
    Array.from(row.cells, (cell) => cell.textContent?.trim() ?? ""),
  );
  const columns = analyzeTableColumns(rows);
  for (const row of Array.from(table.rows)) {
    Array.from(row.cells).forEach((cell, index) => {
      const column = columns[index];
      if (column) cell.dataset.colSize = column.size;
    });
  }
}
