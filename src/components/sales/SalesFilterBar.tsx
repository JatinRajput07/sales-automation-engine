import { Filter, Download, Bookmark, X, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export interface SalesFilterChip {
  key: string;
  label: string;
  value: string;
  onClear?: () => void;
}

interface Props {
  search?: string;
  onSearch?: (v: string) => void;
  searchPlaceholder?: string;
  chips?: SalesFilterChip[];
  onClearAll?: () => void;
  onExport?: () => void;
  onSave?: () => void;
  /** extra pickers (selects, etc.) shown inline before the chip list */
  extra?: React.ReactNode;
  /** right-aligned (e.g. view toggle) */
  right?: React.ReactNode;
}

/**
 * Unified filter bar used across all Sales list pages — same look & feel as the dashboard FilterBar.
 */
export function SalesFilterBar({
  search, onSearch, searchPlaceholder = "Search…",
  chips = [], onClearAll, onExport, onSave, extra, right,
}: Props) {
  return (
    <div className="h-10 px-3 flex items-center gap-2 border-b border-border bg-surface/50 text-xs">
      {onSearch !== undefined && (
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search ?? ""}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-7 pl-7 w-56 text-xs"
          />
        </div>
      )}
      <button className="flex items-center gap-1.5 h-6 px-2 rounded-sm border border-border hover:bg-surface-hover">
        <Filter className="w-3 h-3" />
        <span>Filters</span>
      </button>
      {extra}
      <div className="flex items-center gap-1 flex-1 min-w-0 overflow-x-auto">
        {chips.map((c) => (
          <span key={c.key} className="flex items-center gap-1 h-5 px-1.5 rounded-sm bg-primary/10 text-primary text-2xs font-medium border border-primary/20 shrink-0">
            <span className="text-primary/70">{c.label}:</span>
            <span>{c.value}</span>
            {c.onClear && (
              <X className="w-2.5 h-2.5 cursor-pointer hover:text-foreground" onClick={c.onClear} />
            )}
          </span>
        ))}
        <button className="flex items-center gap-0.5 h-5 px-1.5 text-2xs text-muted-foreground hover:text-foreground shrink-0">
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>
      {chips.length > 0 && onClearAll && (
        <button onClick={onClearAll} className="text-2xs text-muted-foreground hover:text-foreground">Clear all</button>
      )}
      <div className="h-4 w-px bg-border" />
      {onSave && (
        <button onClick={onSave} className="flex items-center gap-1 h-6 px-2 rounded-sm hover:bg-surface-hover text-muted-foreground hover:text-foreground">
          <Bookmark className="w-3 h-3" />
          <span>Save</span>
        </button>
      )}
      {onExport && (
        <button onClick={onExport} className="flex items-center gap-1 h-6 px-2 rounded-sm hover:bg-surface-hover text-muted-foreground hover:text-foreground">
          <Download className="w-3 h-3" />
          <span>Export</span>
        </button>
      )}
      {right}
    </div>
  );
}
