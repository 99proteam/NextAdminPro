"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, Archive, LayoutGrid, List, MoreHorizontal, Package, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/data";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { DataTable, type Column } from "@/components/data-table/data-table";
import { StatusBadge, stockStatus } from "@/components/status-badge";
import { ConfirmDialog, FormField } from "@/components/form-helpers";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

export function ProductsView({ initial }: { initial: Product[] }) {
  const params = useSearchParams();
  const [data, setData] = React.useState(initial);
  const [view, setView] = React.useState<"table" | "grid">("table");
  const [editing, setEditing] = React.useState<Product | null>(null);
  const [formOpen, setFormOpen] = React.useState(params.get("new") === "1");
  const [deleting, setDeleting] = React.useState<Product[] | null>(null);
  const categories = [...new Set(initial.map((p) => p.category))].sort();

  const lowStock = data.filter((p) => p.stock > 0 && p.stock <= p.reorderLevel);
  const outOfStock = data.filter((p) => p.stock === 0);
  const inventoryValue = data.reduce((a, p) => a + p.stock * p.cost, 0);

  const actions = (p: Product) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${p.name}`}><MoreHorizontal /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={() => { setEditing(p); setFormOpen(true); }}><Pencil /> Edit</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => restock([p])}><Package /> Restock +50</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => archive([p])}><Archive /> Archive</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive onSelect={() => setDeleting([p])}><Trash2 /> Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const restock = (rows: Product[]) => {
    const ids = new Set(rows.map((r) => r.id));
    setData((d) => d.map((p) => (ids.has(p.id) ? { ...p, stock: p.stock + 50 } : p)));
    toast.success(`Restocked ${rows.length} product${rows.length > 1 ? "s" : ""}`);
  };
  const archive = (rows: Product[]) => {
    const ids = new Set(rows.map((r) => r.id));
    setData((d) => d.map((p) => (ids.has(p.id) ? { ...p, status: "archived" } : p)));
    toast.success(`Archived ${rows.length} product${rows.length > 1 ? "s" : ""}`);
  };

  const columns: Column<Product>[] = [
    {
      id: "name",
      header: "Product",
      hideable: false,
      sortValue: (p) => p.name,
      cell: (p) => (
        <div className="flex items-center gap-3">
          <ProductThumb product={p} />
          <div>
            <p className="font-medium">{p.name}</p>
            <p className="text-xs text-muted-foreground">{p.sku}</p>
          </div>
        </div>
      ),
    },
    { id: "category", header: "Category", sortValue: (p) => p.category, cell: (p) => p.category },
    { id: "price", header: "Price", sortValue: (p) => p.price, cell: (p) => <span className="tabular">{formatCurrency(p.price)}</span>, className: "text-right", headClassName: "text-right" },
    { id: "margin", header: "Margin", sortValue: (p) => (p.price - p.cost) / p.price, exportValue: (p) => `${(((p.price - p.cost) / p.price) * 100).toFixed(0)}%`, cell: (p) => <span className="tabular text-muted-foreground">{(((p.price - p.cost) / p.price) * 100).toFixed(0)}%</span>, className: "text-right", headClassName: "text-right", defaultHidden: true },
    {
      id: "stock",
      header: "Stock",
      sortValue: (p) => p.stock,
      cell: (p) => (
        <div className="flex items-center gap-2">
          <span className="w-10 text-right tabular">{p.stock}</span>
          <StatusBadge status={stockStatus(p.stock, p.reorderLevel)} />
        </div>
      ),
    },
    { id: "sold", header: "Sold", sortValue: (p) => p.sold, cell: (p) => <span className="tabular">{formatNumber(p.sold)}</span>, className: "text-right", headClassName: "text-right" },
    { id: "rating", header: "Rating", sortValue: (p) => p.rating, cell: (p) => <span className="inline-flex items-center gap-1 tabular"><Star className="size-3.5 fill-chart-4 text-chart-4" /> {p.rating}</span> },
    { id: "status", header: "Status", sortValue: (p) => p.status, cell: (p) => <StatusBadge status={p.status} /> },
    { id: "actions", header: "", hideable: false, className: "w-10", cell: actions },
  ];

  const onSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const price = Number(f.price);
    const stock = Number(f.stock);
    if (!f.name.trim() || !(price > 0) || !(stock >= 0)) {
      toast.error("Name, a positive price and stock are required");
      return;
    }
    const patch = { name: f.name, category: f.category, price, stock, status: f.status as Product["status"], sku: f.sku || `NEW-${Date.now() % 10000}` };
    if (editing) {
      setData((d) => d.map((p) => (p.id === editing.id ? { ...p, ...patch } : p)));
      toast.success("Product updated");
    } else {
      setData((d) => [{ ...patch, id: `prd_new_${d.length}`, cost: Math.round(price * 0.45), reorderLevel: 15, sold: 0, rating: 0, createdAt: new Date().toISOString() }, ...d]);
      toast.success("Product created");
    }
    setFormOpen(false);
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">Catalog, pricing and inventory levels.</p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}><Plus /> Add product</Button>
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total products", String(data.length)],
          ["Inventory value", formatCurrency(inventoryValue, "USD", true)],
          ["Low stock", String(lowStock.length)],
          ["Out of stock", String(outOfStock.length)],
        ].map(([label, value]) => (
          <Card key={label} className="p-5">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight tabular">{value}</p>
          </Card>
        ))}
      </div>

      {lowStock.length + outOfStock.length > 0 && (
        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-warning/40 bg-warning/8 p-4 text-sm sm:flex-row sm:items-center">
          <AlertTriangle className="size-5 shrink-0 text-warning" />
          <p className="flex-1">
            <span className="font-medium">{lowStock.length + outOfStock.length} products need attention.</span>{" "}
            <span className="text-muted-foreground">{[...outOfStock, ...lowStock].slice(0, 3).map((p) => p.name).join(", ")}{lowStock.length + outOfStock.length > 3 ? "…" : ""}</span>
          </p>
          <Button size="sm" variant="outline" onClick={() => restock([...lowStock, ...outOfStock])}>Restock all</Button>
        </div>
      )}

      <DataTable
        data={data}
        columns={columns}
        getRowId={(p) => p.id}
        searchPlaceholder="Search products or SKU…"
        searchText={(p) => `${p.name} ${p.sku} ${p.category}`}
        initialSearch={params.get("q") ?? ""}
        filters={[
          { id: "category", label: "Category", value: (p) => p.category, options: categories.map((c) => ({ label: c, value: c })) },
          { id: "stock", label: "Stock", value: (p) => stockStatus(p.stock, p.reorderLevel), options: [{ label: "In stock", value: "in-stock" }, { label: "Low stock", value: "low-stock" }, { label: "Out of stock", value: "out-of-stock" }] },
          { id: "status", label: "Status", value: (p) => p.status, options: [{ label: "Active", value: "active" }, { label: "Draft", value: "draft" }, { label: "Archived", value: "archived" }] },
        ]}
        initialSort={{ id: "sold", desc: true }}
        exportName="products"
        toolbarExtra={
          <div className="flex rounded-md border bg-card p-0.5">
            <Button variant="ghost" size="icon-sm" className={cn("h-7", view === "table" && "bg-muted")} onClick={() => setView("table")} aria-label="Table view" aria-pressed={view === "table"}><List /></Button>
            <Button variant="ghost" size="icon-sm" className={cn("h-7", view === "grid" && "bg-muted")} onClick={() => setView("grid")} aria-label="Grid view" aria-pressed={view === "grid"}><LayoutGrid /></Button>
          </div>
        }
        bulkActions={(rows, clear) => (
          <>
            <Button variant="outline" size="sm" onClick={() => { restock(rows); clear(); }}><Package /> Restock</Button>
            <Button variant="outline" size="sm" onClick={() => { archive(rows); clear(); }}><Archive /> Archive</Button>
            <Button variant="outline" size="sm" className="text-destructive" onClick={() => { setDeleting(rows); clear(); }}><Trash2 /> Delete</Button>
          </>
        )}
        renderGrid={
          view === "grid"
            ? (rows) => (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {rows.map((p) => (
                    <Card key={p.id} className="flex flex-col overflow-hidden">
                      <div className="flex aspect-[4/3] items-center justify-center bg-muted">
                        <ProductThumb product={p} large />
                      </div>
                      <div className="flex flex-1 flex-col gap-2 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-medium">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.category} · {p.sku}</p>
                          </div>
                          {actions(p)}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold tabular">{formatCurrency(p.price)}</span>
                          <StatusBadge status={stockStatus(p.stock, p.reorderLevel)} />
                        </div>
                        <div className="mt-auto">
                          <div className="mb-1 flex justify-between text-xs text-muted-foreground"><span>{p.stock} in stock</span><span>{formatNumber(p.sold)} sold</span></div>
                          <Progress value={Math.min(100, (p.stock / 400) * 100)} />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )
            : undefined
        }
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit product" : "Add product"}</DialogTitle>
            <DialogDescription>Pricing and stock update instantly across the dashboard.</DialogDescription>
          </DialogHeader>
          <form key={editing?.id ?? "new"} onSubmit={onSave} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><FormField label="Product name" name="name" defaultValue={editing?.name} required /></div>
            <FormField label="SKU" name="sku" defaultValue={editing?.sku} placeholder="Auto-generated" />
            <div className="flex flex-col gap-1.5">
              <Label>Category</Label>
              <Select name="category" defaultValue={editing?.category ?? categories[0]}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <FormField label="Price (USD)" name="price" type="number" step="0.01" min="0" defaultValue={editing?.price} required />
            <FormField label="Stock" name="stock" type="number" min="0" defaultValue={editing?.stock ?? 0} required />
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label>Status</Label>
              <Select name="status" defaultValue={editing?.status ?? "active"}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit">{editing ? "Save changes" : "Create product"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete ${deleting?.length === 1 ? deleting[0].name : `${deleting?.length} products`}?`}
        description="The product will be removed from your catalog."
        onConfirm={() => {
          const ids = new Set(deleting?.map((d) => d.id));
          setData((d) => d.filter((p) => !ids.has(p.id)));
          toast.success("Deleted");
          setDeleting(null);
        }}
      />
    </>
  );
}

const thumbTones = ["bg-chart-1/15 text-chart-1", "bg-chart-2/15 text-chart-2", "bg-chart-3/15 text-chart-3", "bg-chart-5/15 text-chart-5"];

function ProductThumb({ product, large }: { product: Product; large?: boolean }) {
  const tone = thumbTones[Number(product.id.replace(/\D/g, "") || 0) % thumbTones.length];
  return (
    <span className={cn("flex shrink-0 items-center justify-center rounded-lg font-semibold", tone, large ? "size-20 text-2xl" : "size-9 text-xs")}>
      {product.name.split(" ").slice(0, 2).map((w) => w[0]).join("")}
    </span>
  );
}
