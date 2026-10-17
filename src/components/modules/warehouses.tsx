"use client";

import { ArrowDownToLine, ArrowLeftRight, ArrowUpFromLine, SlidersHorizontal, Warehouse } from "lucide-react";
import { stockMovements, warehouses, type StockMovement } from "@/lib/data/modules";
import { products } from "@/lib/data";
import { cn, formatDate, formatNumber } from "@/lib/utils";
import { CrudPage } from "@/components/crud/crud-page";
import { Avatar } from "@/components/ui/avatar";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const typeMeta: Record<StockMovement["type"], { icon: typeof Warehouse; variant: BadgeVariant }> = {
  inbound: { icon: ArrowDownToLine, variant: "success" },
  outbound: { icon: ArrowUpFromLine, variant: "default" },
  transfer: { icon: ArrowLeftRight, variant: "secondary" },
  adjustment: { icon: SlidersHorizontal, variant: "warning" },
};

export function WarehousesModule() {
  return (
    <CrudPage<StockMovement>
      title="Warehouses & stock"
      description="Capacity across locations and every stock movement in and out."
      entity="stock movement"
      initial={stockMovements}
      exportName="stock-movements"
      pageSize={15}
      initialSort={{ id: "date", desc: true }}
      searchText={(m) => `${m.product} ${m.sku} ${m.reference} ${m.warehouse}`}
      filters={[
        { id: "type", label: "Type", value: (m) => m.type, options: Object.keys(typeMeta).map((t) => ({ label: t[0].toUpperCase() + t.slice(1), value: t })) },
        { id: "warehouse", label: "Warehouse", value: (m) => m.warehouse, options: warehouses.map((w) => ({ label: w.name, value: w.name })) },
      ]}
      columns={[
        { id: "product", header: "Product", hideable: false, sortValue: (m) => m.product, cell: (m) => <div><p className="font-medium">{m.product}</p><p className="font-mono text-xs text-muted-foreground">{m.sku}</p></div> },
        { id: "type", header: "Type", sortValue: (m) => m.type, cell: (m) => { const t = typeMeta[m.type]; return <Badge variant={t.variant} className="capitalize"><t.icon />{m.type}</Badge>; } },
        { id: "quantity", header: "Qty", sortValue: (m) => m.quantity, className: "text-right", headClassName: "text-right", cell: (m) => <span className={cn("font-medium tabular", m.quantity > 0 ? "text-success" : "text-foreground")}>{m.quantity > 0 ? "+" : ""}{m.quantity}</span> },
        { id: "warehouse", header: "Warehouse", sortValue: (m) => m.warehouse, cell: (m) => m.warehouse },
        { id: "reference", header: "Reference", sortValue: (m) => m.reference, cell: (m) => <span className="font-mono text-xs text-muted-foreground">{m.reference}</span> },
        { id: "user", header: "By", sortValue: (m) => m.user, cell: (m) => <Avatar name={m.user} className="size-6 text-[10px]" /> },
        { id: "date", header: "Date", sortValue: (m) => m.date, exportValue: (m) => m.date, cell: (m) => <span className="text-muted-foreground">{formatDate(m.date, { dateStyle: "medium", timeStyle: "short" })}</span> },
      ]}
      fields={[
        { name: "product", label: "Product", type: "select", options: products.map((p) => p.name), full: true },
        { name: "type", label: "Movement type", type: "select", options: ["inbound", "outbound", "transfer", "adjustment"] },
        { name: "quantity", label: "Quantity", type: "number", required: true },
        { name: "warehouse", label: "Warehouse", type: "select", options: warehouses.map((w) => w.name) },
        { name: "reference", label: "Reference", placeholder: "PO, order or transfer #" },
      ]}
      toForm={(m) => ({ ...m })}
      fromForm={(v, e) => {
        const p = products.find((x) => x.name === v.product);
        const qty = Math.abs(Number(v.quantity) || 0);
        return { id: e?.id ?? `mv_${Date.now()}`, product: String(v.product), sku: p?.sku ?? "—", type: v.type as StockMovement["type"], quantity: v.type === "outbound" ? -qty : qty, warehouse: String(v.warehouse), reference: String(v.reference) || "—", user: e?.user ?? "Alex Morgan", date: e?.date ?? new Date().toISOString() };
      }}
    >
      {() => (
        <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {warehouses.map((w) => {
            const pct = Math.round((w.used / w.capacity) * 100);
            return (
              <Card key={w.id} className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{w.name}</p>
                    <p className="text-xs text-muted-foreground">{w.city}</p>
                  </div>
                  <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground"><Warehouse className="size-4" /></span>
                </div>
                <p className="mt-4 text-sm"><span className="text-2xl font-semibold tabular">{pct}%</span> <span className="text-muted-foreground">capacity used</span></p>
                <Progress value={pct} className="mt-2" indicatorClassName={cn(pct > 85 && "bg-destructive", pct > 70 && pct <= 85 && "bg-warning")} />
                <p className="mt-2 text-xs text-muted-foreground tabular">{formatNumber(w.used)} / {formatNumber(w.capacity)} units</p>
              </Card>
            );
          })}
        </div>
      )}
    </CrudPage>
  );
}
