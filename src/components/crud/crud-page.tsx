"use client";

import * as React from "react";
import { MoreHorizontal, Pencil, Plus, Trash2, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DataTable, type Column, type FacetFilter } from "@/components/data-table/data-table";
import { ConfirmDialog } from "@/components/form-helpers";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export interface Stat<T> {
  label: string;
  value: (rows: T[]) => string;
  hint?: (rows: T[]) => string;
  tone?: (rows: T[]) => "default" | "success" | "warning" | "destructive";
  icon?: LucideIcon;
}

export type Field =
  | { name: string; label: string; type?: "text" | "email" | "number" | "date" | "time" | "url"; required?: boolean; placeholder?: string; full?: boolean; step?: string }
  | { name: string; label: string; type: "select"; options: string[]; required?: boolean; full?: boolean }
  | { name: string; label: string; type: "textarea"; required?: boolean; placeholder?: string; full?: boolean }
  | { name: string; label: string; type: "switch"; full?: boolean };

export interface RowAction<T> {
  label: string;
  icon: LucideIcon;
  onSelect: (row: T, api: CrudApi<T>) => void;
  hidden?: (row: T) => boolean;
  destructive?: boolean;
}

export interface BulkAction<T> {
  label: string;
  icon: LucideIcon;
  apply: (row: T) => Partial<T>;
  message?: (count: number) => string;
  destructive?: boolean;
}

export interface CrudApi<T> {
  update: (id: string, patch: Partial<T>, message?: string) => void;
  remove: (id: string) => void;
  add: (row: T) => void;
  rows: T[];
}

interface CrudPageProps<T extends { id: string }> {
  title: string;
  description: string;
  entity: string; // singular, e.g. "employee"
  initial: T[];
  columns: Column<T>[];
  stats?: Stat<T>[];
  filters?: FacetFilter<T>[];
  searchText: (row: T) => string;
  searchPlaceholder?: string;
  initialSort?: { id: string; desc: boolean };
  fields?: Field[];
  /** Build a record from submitted form values. `existing` is set when editing. */
  fromForm?: (values: Record<string, string | boolean>, existing: T | null) => T;
  /** Values to pre-fill the form with when editing. */
  toForm?: (row: T) => Record<string, unknown>;
  rowActions?: RowAction<T>[];
  bulkActions?: BulkAction<T>[];
  onRowClick?: (row: T, api: CrudApi<T>) => void;
  exportName?: string;
  headerExtra?: React.ReactNode;
  /** Optional content rendered between the stats and the table (charts, alerts…). */
  children?: (api: CrudApi<T>) => React.ReactNode;
  renderGrid?: (rows: T[], api: CrudApi<T>) => React.ReactNode;
  toolbarExtra?: React.ReactNode;
  pageSize?: number;
}

const toneClass = { default: "", success: "text-success", warning: "text-warning", destructive: "text-destructive" };

export function CrudPage<T extends { id: string }>({
  title,
  description,
  entity,
  initial,
  columns,
  stats = [],
  filters,
  searchText,
  searchPlaceholder,
  initialSort,
  fields,
  fromForm,
  toForm,
  rowActions = [],
  bulkActions = [],
  onRowClick,
  exportName,
  headerExtra,
  children,
  renderGrid,
  toolbarExtra,
  pageSize,
}: CrudPageProps<T>) {
  const [rows, setRows] = React.useState(initial);
  const [editing, setEditing] = React.useState<T | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState<T[] | null>(null);
  const canEdit = !!(fields && fromForm);

  const api: CrudApi<T> = React.useMemo(
    () => ({
      rows,
      update: (id, patch, message) => {
        setRows((list) => list.map((r) => (r.id === id ? { ...r, ...patch } : r)));
        if (message) toast.success(message);
      },
      remove: (id) => setRows((list) => list.filter((r) => r.id !== id)),
      add: (row) => setRows((list) => [row, ...list]),
    }),
    [rows],
  );

  const actionColumn: Column<T> | null =
    canEdit || rowActions.length
      ? {
          id: "__actions",
          header: "",
          hideable: false,
          className: "w-10",
          cell: (row) => (
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label="Row actions">
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {canEdit && (
                    <DropdownMenuItem
                      onSelect={() => {
                        setEditing(row);
                        setFormOpen(true);
                      }}
                    >
                      <Pencil /> Edit
                    </DropdownMenuItem>
                  )}
                  {rowActions
                    .filter((a) => !a.hidden?.(row))
                    .map((a) => (
                      <DropdownMenuItem key={a.label} destructive={a.destructive} onSelect={() => a.onSelect(row, api)}>
                        <a.icon /> {a.label}
                      </DropdownMenuItem>
                    ))}
                  {canEdit && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem destructive onSelect={() => setDeleting([row])}>
                        <Trash2 /> Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ),
        }
      : null;

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!fields || !fromForm) return;
    const fd = new FormData(e.currentTarget);
    const values: Record<string, string | boolean> = {};
    for (const f of fields) {
      values[f.name] = f.type === "switch" ? fd.get(f.name) === "on" : String(fd.get(f.name) ?? "").trim();
    }
    const missing = fields.find((f) => "required" in f && f.required && !values[f.name]);
    if (missing) {
      toast.error(`${missing.label} is required`);
      return;
    }
    const record = fromForm(values, editing);
    if (editing) {
      setRows((list) => list.map((r) => (r.id === editing.id ? record : r)));
      toast.success(`${capitalize(entity)} updated`);
    } else {
      setRows((list) => [record, ...list]);
      toast.success(`${capitalize(entity)} created`);
    }
    setFormOpen(false);
  };

  const defaults: Record<string, unknown> = editing && toForm ? toForm(editing) : {};

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {headerExtra}
          {canEdit && (
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus /> Add {entity}
            </Button>
          )}
        </div>
      </div>

      {stats.length > 0 && (
        <div className={cn("mb-4 grid gap-4 sm:grid-cols-2", stats.length >= 4 ? "xl:grid-cols-4" : "xl:grid-cols-3")}>
          {stats.map((s) => {
            const tone = s.tone?.(rows) ?? "default";
            return (
              <Card key={s.label} className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  {s.icon && (
                    <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <s.icon className="size-4" />
                    </span>
                  )}
                </div>
                <p className={cn("mt-2 text-2xl font-semibold tracking-tight tabular", toneClass[tone])}>{s.value(rows)}</p>
                {s.hint && <p className="mt-1 text-xs text-muted-foreground">{s.hint(rows)}</p>}
              </Card>
            );
          })}
        </div>
      )}

      {children?.(api)}

      <DataTable
        data={rows}
        columns={actionColumn ? [...columns, actionColumn] : columns}
        getRowId={(r) => r.id}
        searchText={searchText}
        searchPlaceholder={searchPlaceholder ?? `Search ${title.toLowerCase()}…`}
        filters={filters}
        initialSort={initialSort}
        exportName={exportName}
        pageSize={pageSize}
        toolbarExtra={toolbarExtra}
        onRowClick={onRowClick ? (r) => onRowClick(r, api) : undefined}
        renderGrid={renderGrid ? (page) => renderGrid(page, api) : undefined}
        bulkActions={
          bulkActions.length || canEdit
            ? (selected, clear) => (
                <>
                  {bulkActions.map((b) => (
                    <Button
                      key={b.label}
                      variant="outline"
                      size="sm"
                      className={cn(b.destructive && "text-destructive")}
                      onClick={() => {
                        const ids = new Set(selected.map((r) => r.id));
                        setRows((list) => list.map((r) => (ids.has(r.id) ? { ...r, ...b.apply(r) } : r)));
                        toast.success(b.message?.(selected.length) ?? `${b.label}: ${selected.length} updated`);
                        clear();
                      }}
                    >
                      <b.icon /> {b.label}
                    </Button>
                  ))}
                  {canEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                      onClick={() => {
                        setDeleting(selected);
                        clear();
                      }}
                    >
                      <Trash2 /> Delete
                    </Button>
                  )}
                </>
              )
            : undefined
        }
      />

      {fields && (
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit" : "Add"} {entity}
              </DialogTitle>
              <DialogDescription>{editing ? `Update this ${entity}’s details.` : `Create a new ${entity}.`}</DialogDescription>
            </DialogHeader>
            <form key={editing?.id ?? "new"} onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
              {fields.map((f) => {
                const value = defaults[f.name];
                const id = `f-${f.name}`;
                const span = f.full || f.type === "textarea" ? "sm:col-span-2" : "";
                if (f.type === "switch")
                  return (
                    <label key={f.name} className={cn("flex items-center justify-between gap-3 rounded-lg border p-3 text-sm font-medium", span)}>
                      {f.label}
                      <Switch name={f.name} defaultChecked={Boolean(value)} />
                    </label>
                  );
                return (
                  <div key={f.name} className={cn("flex flex-col gap-1.5", span)}>
                    <Label htmlFor={id}>{f.label}</Label>
                    {f.type === "select" ? (
                      <Select name={f.name} defaultValue={String(value ?? f.options[0])}>
                        <SelectTrigger id={id}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {f.options.map((o) => (
                            <SelectItem key={o} value={o} className="capitalize">
                              {o.replace(/-/g, " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : f.type === "textarea" ? (
                      <Textarea id={id} name={f.name} defaultValue={value as string | undefined} placeholder={f.placeholder} />
                    ) : (
                      <Input
                        id={id}
                        name={f.name}
                        type={f.type ?? "text"}
                        step={"step" in f ? f.step : undefined}
                        defaultValue={value as string | number | undefined}
                        placeholder={"placeholder" in f ? f.placeholder : undefined}
                      />
                    )}
                  </div>
                );
              })}
              <DialogFooter className="sm:col-span-2">
                <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editing ? "Save changes" : `Create ${entity}`}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete ${deleting?.length === 1 ? `this ${entity}` : `${deleting?.length} ${entity}s`}?`}
        description="This can’t be undone."
        onConfirm={() => {
          const ids = new Set(deleting?.map((d) => d.id));
          setRows((list) => list.filter((r) => !ids.has(r.id)));
          toast.success("Deleted");
          setDeleting(null);
        }}
      />
    </>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Today's date (from the demo clock) as YYYY-MM-DD, for date inputs. */
export const dateOnly = (iso: string) => iso.slice(0, 10);
