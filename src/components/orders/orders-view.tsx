"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Truck, XCircle } from "lucide-react";
import { toast } from "sonner";
import type { Order, OrderStatus } from "@/lib/data";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { DataTable, type Column } from "@/components/data-table/data-table";
import { StatusBadge } from "@/components/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const statusTabs: ("all" | OrderStatus)[] = ["all", "pending", "processing", "shipped", "delivered", "cancelled", "refunded"];

export function OrdersView({ initial }: { initial: Order[] }) {
  const router = useRouter();
  const [data, setData] = React.useState(initial);
  const [tab, setTab] = React.useState<(typeof statusTabs)[number]>("all");
  const rows = tab === "all" ? data : data.filter((o) => o.status === tab);
  const count = (s: (typeof statusTabs)[number]) => (s === "all" ? data.length : data.filter((o) => o.status === s).length);

  const update = (list: Order[], status: OrderStatus) => {
    const ids = new Set(list.map((o) => o.id));
    setData((d) => d.map((o) => (ids.has(o.id) ? { ...o, status } : o)));
    toast.success(`${list.length} order${list.length > 1 ? "s" : ""} marked ${status}`);
  };

  const columns: Column<Order>[] = [
    { id: "number", header: "Order", hideable: false, sortValue: (o) => o.number, cell: (o) => <span className="font-medium">{o.number}</span> },
    {
      id: "customer",
      header: "Customer",
      sortValue: (o) => o.customerName,
      cell: (o) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={o.customerName} className="size-7" />
          <div>
            <p className="font-medium">{o.customerName}</p>
            <p className="text-xs text-muted-foreground">{o.customerEmail}</p>
          </div>
        </div>
      ),
    },
    { id: "date", header: "Date", sortValue: (o) => o.createdAt, exportValue: (o) => o.createdAt.slice(0, 10), cell: (o) => <span className="text-muted-foreground">{formatDate(o.createdAt)}</span> },
    { id: "items", header: "Items", sortValue: (o) => o.items.reduce((a, i) => a + i.quantity, 0), cell: (o) => <span className="tabular">{o.items.reduce((a, i) => a + i.quantity, 0)}</span> },
    { id: "payment", header: "Payment", sortValue: (o) => o.payment, cell: (o) => <span className="text-muted-foreground">{o.payment}</span> },
    { id: "status", header: "Status", sortValue: (o) => o.status, cell: (o) => <StatusBadge status={o.status} /> },
    { id: "total", header: "Total", sortValue: (o) => o.total, cell: (o) => <span className="font-medium tabular">{formatCurrency(o.total)}</span>, className: "text-right", headClassName: "text-right" },
  ];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track, fulfil and manage every order.</p>
      </div>

      <div className="mb-4 flex gap-1 overflow-x-auto border-b">
        {statusTabs.map((s) => (
          <button
            key={s}
            onClick={() => setTab(s)}
            className={cn(
              "-mb-px flex shrink-0 cursor-pointer items-center gap-2 border-b-2 border-transparent px-3 py-2.5 text-sm font-medium capitalize text-muted-foreground hover:text-foreground",
              tab === s && "border-primary text-foreground",
            )}
          >
            {s}
            <span className="rounded-full bg-muted px-1.5 text-[11px] tabular">{count(s)}</span>
          </button>
        ))}
      </div>

      <DataTable
        key={tab}
        data={rows}
        columns={columns}
        getRowId={(o) => o.id}
        searchPlaceholder="Search order # or customer…"
        searchText={(o) => `${o.number} ${o.customerName} ${o.customerEmail}`}
        filters={[
          { id: "payment", label: "Payment", value: (o) => o.payment, options: ["Card", "PayPal", "Apple Pay", "Bank transfer"].map((p) => ({ label: p, value: p })) },
        ]}
        initialSort={{ id: "date", desc: true }}
        exportName="orders"
        onRowClick={(o) => router.push(`/dashboard/orders/${o.id}`)}
        bulkActions={(list, clear) => (
          <>
            <Button variant="outline" size="sm" onClick={() => { update(list, "shipped"); clear(); }}><Truck /> Mark shipped</Button>
            <Button variant="outline" size="sm" onClick={() => { update(list, "delivered"); clear(); }}><CheckCircle2 /> Mark delivered</Button>
            <Button variant="outline" size="sm" className="text-destructive" onClick={() => { update(list, "cancelled"); clear(); }}><XCircle /> Cancel</Button>
          </>
        )}
      />
    </>
  );
}
