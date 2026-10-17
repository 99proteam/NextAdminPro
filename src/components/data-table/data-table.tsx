"use client";

import * as React from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Columns3,
  Download,
  Filter,
  Search,
  X,
} from "lucide-react";
import { cn, downloadCsv } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Column<T> {
  id: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  /** Value used for sorting. Omit to make the column unsortable. */
  sortValue?: (row: T) => string | number;
  /** Value written to CSV exports. Defaults to sortValue. */
  exportValue?: (row: T) => string | number;
  className?: string;
  headClassName?: string;
  hideable?: boolean;
  defaultHidden?: boolean;
}

export interface FacetFilter<T> {
  id: string;
  label: string;
  options: { label: string; value: string }[];
  value: (row: T) => string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  getRowId: (row: T) => string;
  searchPlaceholder?: string;
  searchText?: (row: T) => string;
  initialSearch?: string;
  filters?: FacetFilter<T>[];
  initialSort?: { id: string; desc: boolean };
  pageSize?: number;
  exportName?: string;
  /** Render bulk actions for the currently selected rows. */
  bulkActions?: (selected: T[], clear: () => void) => React.ReactNode;
  toolbarExtra?: React.ReactNode;
  onRowClick?: (row: T) => void;
  emptyState?: React.ReactNode;
  /** Render the current page as a custom layout (e.g. a card grid) instead of the table. */
  renderGrid?: (rows: T[]) => React.ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  getRowId,
  searchPlaceholder = "Search…",
  searchText,
  initialSearch = "",
  filters = [],
  initialSort,
  pageSize: initialPageSize = 10,
  exportName,
  bulkActions,
  toolbarExtra,
  onRowClick,
  emptyState,
  renderGrid,
}: DataTableProps<T>) {
  const [query, setQuery] = React.useState(initialSearch);
  const [facets, setFacets] = React.useState<Record<string, Set<string>>>({});
  const [sort, setSort] = React.useState(initialSort);
  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(initialPageSize);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [hidden, setHidden] = React.useState<Set<string>>(
    () => new Set(columns.filter((c) => c.defaultHidden).map((c) => c.id)),
  );

  const visibleColumns = columns.filter((c) => !hidden.has(c.id));

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = data.filter((row) => {
      if (q && searchText && !searchText(row).toLowerCase().includes(q)) return false;
      return filters.every((f) => {
        const set = facets[f.id];
        return !set || set.size === 0 || set.has(f.value(row));
      });
    });
    const col = sort && columns.find((c) => c.id === sort.id);
    if (sort && col?.sortValue) {
      const get = col.sortValue;
      out = [...out].sort((a, b) => {
        const av = get(a);
        const bv = get(b);
        const r = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
        return sort.desc ? -r : r;
      });
    }
    return out;
  }, [data, query, searchText, filters, facets, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const pageRows = rows.slice(currentPage * pageSize, currentPage * pageSize + pageSize);

  const selectedRows = React.useMemo(() => data.filter((r) => selected.has(getRowId(r))), [data, selected, getRowId]);
  const pageIds = pageRows.map(getRowId);
  const allOnPage = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const someOnPage = pageIds.some((id) => selected.has(id));

  const toggleSort = (id: string) => {
    setSort((s) => (s?.id !== id ? { id, desc: false } : s.desc ? undefined : { id, desc: true }));
  };

  const toggleFacet = (id: string, value: string) => {
    setFacets((f) => {
      const next = new Set(f[id]);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return { ...f, [id]: next };
    });
    setPage(0);
  };

  const activeFilterCount = Object.values(facets).reduce((a, s) => a + s.size, 0);
  const clearSelection = () => setSelected(new Set());

  const exportCsv = () => {
    const source = selectedRows.length ? selectedRows : rows;
    const exportable = columns.filter((c) => c.exportValue || c.sortValue);
    downloadCsv(
      `${exportName ?? "export"}.csv`,
      source.map((r) =>
        Object.fromEntries(exportable.map((c) => [c.header, (c.exportValue ?? c.sortValue)!(r)])),
      ),
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <div className="relative w-full lg:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            placeholder={searchPlaceholder}
            className="pl-9"
            aria-label="Search table"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((f) => {
            const set = facets[f.id];
            return (
              <DropdownMenu key={f.id}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className={cn("border-dashed", set?.size && "border-solid")}>
                    <Filter />
                    {f.label}
                    {set && set.size > 0 && (
                      <span className="rounded bg-primary/10 px-1.5 text-[11px] font-semibold text-primary">{set.size}</span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuLabel>{f.label}</DropdownMenuLabel>
                  {f.options.map((o) => (
                    <DropdownMenuCheckboxItem
                      key={o.value}
                      checked={set?.has(o.value) ?? false}
                      onCheckedChange={() => toggleFacet(f.id, o.value)}
                      onSelect={(e) => e.preventDefault()}
                    >
                      <span className="flex-1">{o.label}</span>
                      <span className="text-xs text-muted-foreground tabular">
                        {data.filter((r) => f.value(r) === o.value).length}
                      </span>
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          })}
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setFacets({})}>
              Reset <X />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 lg:ml-auto">
          {toolbarExtra}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Columns3 /> <span className="hidden sm:inline">Columns</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {columns
                .filter((c) => c.hideable !== false)
                .map((c) => (
                  <DropdownMenuCheckboxItem
                    key={c.id}
                    checked={!hidden.has(c.id)}
                    onSelect={(e) => e.preventDefault()}
                    onCheckedChange={(v) =>
                      setHidden((h) => {
                        const next = new Set(h);
                        if (v) next.delete(c.id);
                        else next.add(c.id);
                        return next;
                      })
                    }
                  >
                    {c.header}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {exportName && (
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download /> <span className="hidden sm:inline">Export</span>
            </Button>
          )}
        </div>
      </div>

      {bulkActions && selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
          <span className="font-medium">{selected.size} selected</span>
          <span className="text-muted-foreground">·</span>
          {bulkActions(selectedRows, clearSelection)}
          <Button variant="ghost" size="sm" className="ml-auto" onClick={clearSelection}>
            Clear
          </Button>
        </div>
      )}

      {renderGrid ? (
        pageRows.length ? renderGrid(pageRows) : <div className="rounded-xl border bg-card py-16 text-center text-sm text-muted-foreground">{emptyState ?? "No results match your filters."}</div>
      ) : (
      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {bulkActions && (
                <TableHead className="w-10">
                  <Checkbox
                    aria-label="Select all on page"
                    checked={allOnPage ? true : someOnPage ? "indeterminate" : false}
                    onCheckedChange={(v) =>
                      setSelected((s) => {
                        const next = new Set(s);
                        pageIds.forEach((id) => (v ? next.add(id) : next.delete(id)));
                        return next;
                      })
                    }
                  />
                </TableHead>
              )}
              {visibleColumns.map((c) => (
                <TableHead key={c.id} className={c.headClassName}>
                  {c.sortValue ? (
                    <button
                      className="inline-flex cursor-pointer items-center gap-1 uppercase hover:text-foreground"
                      onClick={() => toggleSort(c.id)}
                      aria-label={`Sort by ${c.header}`}
                    >
                      {c.header}
                      {sort?.id === c.id ? (
                        sort.desc ? <ArrowDown className="size-3" /> : <ArrowUp className="size-3" />
                      ) : (
                        <ArrowUpDown className="size-3 opacity-40" />
                      )}
                    </button>
                  ) : (
                    c.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={visibleColumns.length + (bulkActions ? 1 : 0)} className="h-40 text-center text-muted-foreground">
                  {emptyState ?? "No results match your filters."}
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((row) => {
                const id = getRowId(row);
                const isSelected = selected.has(id);
                return (
                  <TableRow
                    key={id}
                    data-state={isSelected ? "selected" : undefined}
                    className={cn(onRowClick && "cursor-pointer")}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {bulkActions && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          aria-label="Select row"
                          checked={isSelected}
                          onCheckedChange={(v) =>
                            setSelected((s) => {
                              const next = new Set(s);
                              if (v) next.add(id);
                              else next.delete(id);
                              return next;
                            })
                          }
                        />
                      </TableCell>
                    )}
                    {visibleColumns.map((c) => (
                      <TableCell key={c.id} className={c.className}>
                        {c.cell(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      )}

      <div className="flex flex-col-reverse items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
        <p className="tabular">
          {rows.length === 0
            ? "0 results"
            : `Showing ${currentPage * pageSize + 1}–${Math.min(rows.length, (currentPage + 1) * pageSize)} of ${rows.length}`}
        </p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline">Rows</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                setPageSize(Number(v));
                setPage(0);
              }}
            >
              <SelectTrigger className="h-8 w-[70px]" aria-label="Rows per page">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50, 100].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <span className="tabular">
            Page {currentPage + 1} of {pageCount}
          </span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon-sm" onClick={() => setPage(0)} disabled={currentPage === 0} aria-label="First page">
              <ChevronsLeft />
            </Button>
            <Button variant="outline" size="icon-sm" onClick={() => setPage(currentPage - 1)} disabled={currentPage === 0} aria-label="Previous page">
              <ChevronLeft />
            </Button>
            <Button variant="outline" size="icon-sm" onClick={() => setPage(currentPage + 1)} disabled={currentPage >= pageCount - 1} aria-label="Next page">
              <ChevronRight />
            </Button>
            <Button variant="outline" size="icon-sm" onClick={() => setPage(pageCount - 1)} disabled={currentPage >= pageCount - 1} aria-label="Last page">
              <ChevronsRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
