import { useCallback, useContext, useLayoutEffect, useRef, useState, type ComponentProps } from "react";
import { StreamdownContext, type StreamdownContextType } from "streamdown";
import { joinClassNames } from "../renderers/shared";
import { applyTableColumnSizes, isNumericCell } from "./column-analysis";
import { TableActions } from "./table-actions";
import { extractMarkdownTable, markdownTableToMarkdown } from "./table-copy";
import { TableDialog } from "./table-dialog";

function tableControl(context: StreamdownContextType, control: "copy" | "fullscreen") {
  if (context.controls === false) return false;
  if (typeof context.controls !== "object") return true;
  const table = context.controls.table;
  if (table === false) return false;
  return typeof table === "object" ? table[control] !== false : true;
}

export function MarkdownTable({ node: _, children, className, ...props }: ComponentProps<"table"> & { node?: unknown }) {
  const context = useContext(StreamdownContext);
  const tableRef = useRef<HTMLTableElement>(null);
  const [expanded, setExpanded] = useState(false);
  const setTableRef = useCallback((table: HTMLTableElement | null) => {
    tableRef.current = table;
    if (table) applyTableColumnSizes(table);
  }, []);
  useLayoutEffect(() => {
    if (tableRef.current) applyTableColumnSizes(tableRef.current);
  });
  const copyText = useCallback(() => tableRef.current ? markdownTableToMarkdown(extractMarkdownTable(tableRef.current)) : "", []);
  const table = (dialog = false) => (
    <table
      className={joinClassNames("smk-markdown-table", dialog ? "smk-markdown-table--dialog" : undefined, className)}
      data-markdown-node="table"
      {...(!dialog ? { ref: setTableRef } : {})}
      {...props}
    >
      {children}
    </table>
  );

  return (
    <div className="smk-markdown-table-container" data-markdown-table="true" data-wide-markdown-block="true">
      <div className="smk-markdown-table-scroller" tabIndex={0}>
        <div className="smk-markdown-table-wrapper">{table()}</div>
      </div>
      <TableActions
        copyText={copyText}
        disabled={context.isAnimating}
        onExpand={() => setExpanded(true)}
        showCopy={tableControl(context, "copy")}
        showExpand={tableControl(context, "fullscreen")}
      />
      <TableDialog onClose={() => setExpanded(false)} open={expanded}>{table(true)}</TableDialog>
    </div>
  );
}

export function MarkdownTableHead({ node: _, className, ...props }: ComponentProps<"thead"> & { node?: unknown }) {
  return <thead className={joinClassNames("smk-markdown-table-head", className)} data-markdown-node="table-head" {...props} />;
}

export function MarkdownTableBody({ node: _, className, ...props }: ComponentProps<"tbody"> & { node?: unknown }) {
  return <tbody className={joinClassNames("smk-markdown-table-body", className)} data-markdown-node="table-body" {...props} />;
}

export function MarkdownTableRow({ node: _, className, ...props }: ComponentProps<"tr"> & { node?: unknown }) {
  return <tr className={joinClassNames("smk-markdown-table-row", className)} data-markdown-node="table-row" {...props} />;
}

export function MarkdownTableHeaderCell({ node: _, className, ...props }: ComponentProps<"th"> & { node?: unknown }) {
  return <th className={joinClassNames("smk-markdown-table-header-cell", "smk-markdown-table-cell--single", className)} data-markdown-node="table-header-cell" {...props} />;
}

export function MarkdownTableCell({ node: _, children, className, ...props }: ComponentProps<"td"> & { node?: unknown }) {
  const text = typeof children === "string" ? children : "";
  return <td className={joinClassNames("smk-markdown-table-cell", "smk-markdown-table-cell--single", isNumericCell(text) ? "smk-markdown-table-cell--numeric" : undefined, className)} data-markdown-node="table-cell" {...props}>{children}</td>;
}
