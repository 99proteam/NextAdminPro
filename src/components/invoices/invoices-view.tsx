"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Plus, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Customer, Invoice } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DataTable, type Column } from "@/components/data-table/data-table";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Line {
  key: number;
  name: string;
  quantity: number;
  price: number;
}

export function InvoicesView({ initial, customers }: { initial: Invoice[]; customers: Customer[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [data, setData] = React.useState(initial);
  const [open, setOpen] = React.useState(params.get("new") === "1");

  const sum = (s: Invoice["status"]) => data.filter((i) => i.status === s).reduce((a, i) => a + i.amount, 0);

  const columns: Column<Invoice>[] = [
    { id: "number", header: "Invoice", hideable: false, sortValue: (i) => i.number, cell: (i) => <span className="font-medium">{i.number}</span> },
    {
      id: "client",
      header: "Client",
      sortValue: (i) => i.customerName,
      cell: (i) => (
        <div>
          <p className="font-medium">{i.customerName}</p>
          <p className="text-xs text-muted-foreground">{i.company}</p>
        </div>
      ),
    },
    { id: "issued", header: "Issued", sortValue: (i) => i.issuedAt, exportValue: (i) => i.issuedAt.slice(0, 10), cell: (i) => <span className="text-muted-foreground">{formatDate(i.issuedAt)}</span> },
    { id: "due", header: "Due", sortValue: (i) => i.dueAt, exportValue: (i) => i.dueAt.slice(0, 10), cell: (i) => <span className="text-muted-foreground">{formatDate(i.dueAt)}</span> },
    { id: "status", header: "Status", sortValue: (i) => i.status, cell: (i) => <StatusBadge status={i.status} /> },
    { id: "amount", header: "Amount", sortValue: (i) => i.amount, cell: (i) => <span className="font-medium tabular">{formatCurrency(i.amount)}</span>, className: "text-right", headClassName: "text-right" },
  ];

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
          <p className="mt-1 text-sm text-muted-foreground">Bill clients, track payments and chase overdue invoices.</p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus /> New invoice</Button>
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Paid", sum("paid"), "text-success"],
          ["Outstanding", sum("unpaid"), "text-warning"],
          ["Overdue", sum("overdue"), "text-destructive"],
          ["Drafts", sum("draft"), "text-muted-foreground"],
        ].map(([label, value, tone]) => (
          <Card key={label as string} className="p-5">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className={`size-2 rounded-full bg-current ${tone}`} /> {label}
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight tabular">{formatCurrency(value as number)}</p>
          </Card>
        ))}
      </div>

      <DataTable
        data={data}
        columns={columns}
        getRowId={(i) => i.id}
        searchPlaceholder="Search invoice # or client…"
        searchText={(i) => `${i.number} ${i.customerName} ${i.company}`}
        filters={[{ id: "status", label: "Status", value: (i) => i.status, options: ["paid", "unpaid", "overdue", "draft"].map((s) => ({ label: s[0].toUpperCase() + s.slice(1), value: s })) }]}
        initialSort={{ id: "issued", desc: true }}
        exportName="invoices"
        onRowClick={(i) => router.push(`/dashboard/invoices/${i.id}`)}
        bulkActions={(rows, clear) => (
          <>
            <Button variant="outline" size="sm" onClick={() => { toast.success(`Reminder sent to ${rows.length} client${rows.length > 1 ? "s" : ""}`); clear(); }}><Send /> Send reminder</Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const ids = new Set(rows.map((r) => r.id));
                setData((d) => d.map((i) => (ids.has(i.id) ? { ...i, status: "paid" } : i)));
                toast.success("Marked as paid");
                clear();
              }}
            >
              <CheckCircle2 /> Mark paid
            </Button>
          </>
        )}
      />

      <NewInvoiceDialog
        open={open}
        onOpenChange={setOpen}
        customers={customers}
        nextNumber={`INV-2026-${2449 + data.length - initial.length}`}
        onCreate={(inv) => {
          setData((d) => [inv, ...d]);
          toast.success(`Invoice ${inv.number} created`);
        }}
      />
    </>
  );
}

function NewInvoiceDialog({
  open,
  onOpenChange,
  customers,
  nextNumber,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  customers: Customer[];
  nextNumber: string;
  onCreate: (inv: Invoice) => void;
}) {
  const [customerId, setCustomerId] = React.useState(customers[0].id);
  const [lines, setLines] = React.useState<Line[]>([{ key: 1, name: "Consulting services", quantity: 1, price: 1200 }]);
  const [taxRate, setTaxRate] = React.useState(8);
  const subtotal = lines.reduce((a, l) => a + l.quantity * l.price, 0);
  const tax = (subtotal * taxRate) / 100;

  const patch = (key: number, p: Partial<Line>) => setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...p } : l)));

  const submit = (status: Invoice["status"]) => {
    const c = customers.find((x) => x.id === customerId)!;
    if (!lines.some((l) => l.name.trim() && l.quantity > 0)) {
      toast.error("Add at least one line item");
      return;
    }
    const now = new Date();
    onCreate({
      id: `inv_new_${now.getTime()}`,
      number: nextNumber,
      orderId: "",
      customerName: c.name,
      customerEmail: c.email,
      company: c.company,
      amount: Math.round((subtotal + tax) * 100) / 100,
      status,
      issuedAt: now.toISOString(),
      dueAt: new Date(now.getTime() + 14 * 86_400_000).toISOString(),
      items: lines.map((l) => ({ productId: String(l.key), name: l.name, quantity: l.quantity, price: l.price })),
    });
    onOpenChange(false);
    setLines([{ key: 1, name: "", quantity: 1, price: 0 }]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>New invoice · {nextNumber}</DialogTitle>
          <DialogDescription>Add line items, then save as draft or send to the client.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
          <div className="flex flex-col gap-1.5">
            <Label>Bill to</Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {customers.slice(0, 25).map((c) => <SelectItem key={c.id} value={c.id}>{c.name} · {c.company}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tax">Tax rate (%)</Label>
            <Input id="tax" type="number" min={0} max={50} value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="hidden grid-cols-[1fr_80px_110px_32px] gap-2 text-xs font-medium text-muted-foreground sm:grid">
            <span>Description</span><span>Qty</span><span>Unit price</span><span />
          </div>
          {lines.map((l) => (
            <div key={l.key} className="grid grid-cols-[1fr_32px] gap-2 sm:grid-cols-[1fr_80px_110px_32px]">
              <Input aria-label="Description" placeholder="Item or service" value={l.name} onChange={(e) => patch(l.key, { name: e.target.value })} className="col-span-1" />
              <Button variant="ghost" size="icon" className="sm:order-last" aria-label="Remove line" disabled={lines.length === 1} onClick={() => setLines((ls) => ls.filter((x) => x.key !== l.key))}><Trash2 /></Button>
              <Input aria-label="Quantity" type="number" min={1} value={l.quantity} onChange={(e) => patch(l.key, { quantity: Number(e.target.value) })} />
              <Input aria-label="Unit price" type="number" min={0} step="0.01" value={l.price} onChange={(e) => patch(l.key, { price: Number(e.target.value) })} />
            </div>
          ))}
          <Button variant="outline" size="sm" className="self-start" onClick={() => setLines((ls) => [...ls, { key: Math.max(...ls.map((x) => x.key)) + 1, name: "", quantity: 1, price: 0 }])}>
            <Plus /> Add line
          </Button>
        </div>
        <dl className="ml-auto flex w-full max-w-xs flex-col gap-1.5 text-sm">
          <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="tabular">{formatCurrency(subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Tax</dt><dd className="tabular">{formatCurrency(tax)}</dd></div>
          <div className="flex justify-between border-t pt-1.5 font-semibold"><dt>Total</dt><dd className="tabular">{formatCurrency(subtotal + tax)}</dd></div>
        </dl>
        <DialogFooter>
          <Button variant="outline" onClick={() => submit("draft")}>Save draft</Button>
          <Button onClick={() => submit("unpaid")}><Send /> Create &amp; send</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
