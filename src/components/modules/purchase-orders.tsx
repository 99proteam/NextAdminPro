"use client";

import { CheckCircle2, ClipboardList, PackageCheck, Send, Wallet, XCircle } from "lucide-react";
import { purchaseOrders, vendors, type PurchaseOrder } from "@/lib/data/modules";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CrudPage, dateOnly } from "@/components/crud/crud-page";
import { StatusBadge } from "@/components/status-badge";

const statuses: PurchaseOrder["status"][] = ["draft", "sent", "confirmed", "received", "cancelled"];

export function PurchaseOrdersModule() {
  return (
    <CrudPage<PurchaseOrder>
      title="Purchase orders"
      description="Order stock from vendors and track deliveries into your warehouses."
      entity="purchase order"
      initial={purchaseOrders}
      exportName="purchase-orders"
      initialSort={{ id: "ordered", desc: true }}
      searchText={(p) => `${p.number} ${p.vendor}`}
      stats={[
        { label: "Open POs", icon: ClipboardList, value: (r) => String(r.filter((p) => ["draft", "sent", "confirmed"].includes(p.status)).length) },
        { label: "Committed spend", icon: Wallet, value: (r) => formatCurrency(r.filter((p) => ["sent", "confirmed"].includes(p.status)).reduce((a, p) => a + p.total, 0)) },
        { label: "Received (90d)", icon: PackageCheck, tone: () => "success", value: (r) => String(r.filter((p) => p.status === "received").length) },
        { label: "Avg. lead time", icon: Send, value: () => "14 days" },
      ]}
      filters={[
        { id: "status", label: "Status", value: (p) => p.status, options: statuses.map((s) => ({ label: s[0].toUpperCase() + s.slice(1), value: s })) },
        { id: "vendor", label: "Vendor", value: (p) => p.vendor, options: vendors.map((v) => ({ label: v.name, value: v.name })) },
      ]}
      columns={[
        { id: "number", header: "PO number", hideable: false, sortValue: (p) => p.number, cell: (p) => <span className="font-mono text-xs font-semibold">{p.number}</span> },
        { id: "vendor", header: "Vendor", sortValue: (p) => p.vendor, cell: (p) => <span className="font-medium">{p.vendor}</span> },
        { id: "items", header: "Items", sortValue: (p) => p.items, cell: (p) => <span className="tabular">{p.items}</span> },
        { id: "ordered", header: "Ordered", sortValue: (p) => p.ordered, exportValue: (p) => dateOnly(p.ordered), cell: (p) => <span className="text-muted-foreground">{formatDate(p.ordered)}</span> },
        { id: "expected", header: "Expected", sortValue: (p) => p.expected, exportValue: (p) => dateOnly(p.expected), cell: (p) => <span className="text-muted-foreground">{formatDate(p.expected)}</span> },
        { id: "status", header: "Status", sortValue: (p) => statuses.indexOf(p.status), exportValue: (p) => p.status, cell: (p) => <StatusBadge status={p.status} /> },
        { id: "total", header: "Total", sortValue: (p) => p.total, className: "text-right", headClassName: "text-right", cell: (p) => <span className="font-medium tabular">{formatCurrency(p.total)}</span> },
      ]}
      rowActions={[
        { label: "Send to vendor", icon: Send, hidden: (p) => p.status !== "draft", onSelect: (p, api) => api.update(p.id, { status: "sent" }, `${p.number} sent to ${p.vendor}`) },
        { label: "Mark received", icon: PackageCheck, hidden: (p) => p.status === "received" || p.status === "cancelled", onSelect: (p, api) => api.update(p.id, { status: "received" }, `${p.number} received – stock updated`) },
        { label: "Cancel", icon: XCircle, destructive: true, hidden: (p) => p.status === "received" || p.status === "cancelled", onSelect: (p, api) => api.update(p.id, { status: "cancelled" }, `${p.number} cancelled`) },
      ]}
      bulkActions={[{ label: "Mark received", icon: CheckCircle2, apply: () => ({ status: "received" }) }]}
      fields={[
        { name: "vendor", label: "Vendor", type: "select", options: vendors.map((v) => v.name), full: true },
        { name: "items", label: "Line items", type: "number", required: true },
        { name: "total", label: "Total (USD)", type: "number", step: "0.01", required: true },
        { name: "expected", label: "Expected delivery", type: "date" },
        { name: "status", label: "Status", type: "select", options: statuses },
      ]}
      toForm={(p) => ({ ...p, expected: dateOnly(p.expected) })}
      fromForm={(v, e) => ({ id: e?.id ?? `po_${Date.now()}`, number: e?.number ?? `PO-2026-${330 + Math.floor(Math.random() * 600)}`, vendor: String(v.vendor), items: Number(v.items) || 1, total: Number(v.total) || 0, ordered: e?.ordered ?? new Date().toISOString(), expected: v.expected ? new Date(String(v.expected)).toISOString() : new Date().toISOString(), status: v.status as PurchaseOrder["status"] })}
    />
  );
}
