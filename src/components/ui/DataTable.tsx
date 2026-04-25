import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface Column<T = any> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
}

interface DataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  empty?: ReactNode;
}

export function DataTable<T,>(props: DataTableProps<NoInfer<T>> & { rows: T[] }) {
  const { columns, rows, rowKey, onRowClick, empty } = props as DataTableProps<T>;
  if (rows.length === 0 && empty) return <>{empty}</>;
  return (
    <div className="overflow-auto">
      <table className="w-full text-xs table-striped">
        <thead className="bg-muted/40 sticky top-0 z-10">
          <tr className="text-2xs uppercase text-muted-foreground tracking-wider">
            {columns.map((c) => (
              <th key={c.key} className={cn("text-left px-3 h-8 font-medium", c.align === "right" && "text-right", c.align === "center" && "text-center", c.className)}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={() => onRowClick?.(row)}
              className={cn("border-t border-border hover:bg-surface-hover transition-colors", onRowClick && "cursor-pointer")}
            >
              {columns.map((c) => (
                <td key={c.key} className={cn("px-3 h-9", c.align === "right" && "text-right", c.align === "center" && "text-center")}>
                  {c.render ? c.render(row) : (row as any)[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
