"use client";

import { Check, CircleDollarSign, Paperclip, Receipt, Wallet, X } from "lucide-react";
import { currentUser } from "@/lib/data";
import { expenses, type Expense } from "@/lib/data/modules";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CrudPage, dateOnly } from "@/components/crud/crud-page";
import { StatusBadge } from "@/components/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const categories: Expense["category"][] = ["Travel", "Meals", "Software", "Hardware", "Office", "Marketing"];

export function ExpensesModule() {
  return (
    <CrudPage<Expense>
      title="Expenses"
      description="Submit, approve and reimburse team spending."
      entity="expense"
      initial={expenses}
      exportName="expenses"
      initialSort={{ id: "date", desc: true }}
      searchText={(x) => `${x.merchant} ${x.employee} ${x.category}`}
      stats={[
        { label: "Spend this period", icon: Wallet, value: (r) => formatCurrency(r.filter((x) => x.status !== "rejected").reduce((a, x) => a + x.amount, 0)) },
        { label: "Awaiting approval", icon: Receipt, tone: (r) => (r.some((x) => x.status === "submitted") ? "warning" : "default"), value: (r) => formatCurrency(r.filter((x) => x.status === "submitted").reduce((a, x) => a + x.amount, 0)), hint: (r) => `${r.filter((x) => x.status === "submitted").length} expenses` },
        { label: "To reimburse", icon: CircleDollarSign, value: (r) => formatCurrency(r.filter((x) => x.status === "approved").reduce((a, x) => a + x.amount, 0)) },
        { label: "Missing receipts", icon: Paperclip, tone: (r) => (r.some((x) => !x.receipt) ? "destructive" : "default"), value: (r) => String(r.filter((x) => !x.receipt).length) },
      ]}
      filters={[
        { id: "status", label: "Status", value: (x) => x.status, options: ["submitted", "approved", "reimbursed", "rejected"].map((v) => ({ label: v[0].toUpperCase() + v.slice(1), value: v })) },
        { id: "category", label: "Category", value: (x) => x.category, options: categories.map((v) => ({ label: v, value: v })) },
      ]}
      columns={[
        { id: "merchant", header: "Merchant", hideable: false, sortValue: (x) => x.merchant, cell: (x) => <div><p className="font-medium">{x.merchant}</p><p className="text-xs text-muted-foreground">{formatDate(x.date)}</p></div> },
        { id: "category", header: "Category", sortValue: (x) => x.category, cell: (x) => <Badge variant="outline">{x.category}</Badge> },
        { id: "employee", header: "Submitted by", sortValue: (x) => x.employee, cell: (x) => <span className="flex items-center gap-2"><Avatar name={x.employee} className="size-6 text-[10px]" />{x.employee}</span> },
        { id: "receipt", header: "Receipt", sortValue: (x) => Number(x.receipt), exportValue: (x) => (x.receipt ? "yes" : "no"), cell: (x) => (x.receipt ? <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Paperclip className="size-3.5" />Attached</span> : <span className="text-xs font-medium text-destructive">Missing</span>) },
        { id: "status", header: "Status", sortValue: (x) => x.status, cell: (x) => <StatusBadge status={x.status} /> },
        { id: "date", header: "Date", sortValue: (x) => x.date, exportValue: (x) => dateOnly(x.date), defaultHidden: true, cell: (x) => formatDate(x.date) },
        { id: "amount", header: "Amount", sortValue: (x) => x.amount, className: "text-right", headClassName: "text-right", cell: (x) => <span className="font-medium tabular">{formatCurrency(x.amount)}</span> },
      ]}
      rowActions={[
        { label: "Approve", icon: Check, hidden: (x) => x.status !== "submitted", onSelect: (x, api) => api.update(x.id, { status: "approved" }, "Expense approved") },
        { label: "Reimburse", icon: CircleDollarSign, hidden: (x) => x.status !== "approved", onSelect: (x, api) => api.update(x.id, { status: "reimbursed" }, `${formatCurrency(x.amount)} reimbursed`) },
        { label: "Reject", icon: X, destructive: true, hidden: (x) => x.status !== "submitted", onSelect: (x, api) => api.update(x.id, { status: "rejected" }, "Expense rejected") },
      ]}
      bulkActions={[
        { label: "Approve", icon: Check, apply: () => ({ status: "approved" }) },
        { label: "Reimburse", icon: CircleDollarSign, apply: () => ({ status: "reimbursed" }) },
      ]}
      fields={[
        { name: "merchant", label: "Merchant", required: true },
        { name: "amount", label: "Amount (USD)", type: "number", step: "0.01", required: true },
        { name: "category", label: "Category", type: "select", options: categories },
        { name: "date", label: "Date", type: "date", required: true },
        { name: "receipt", label: "Receipt attached", type: "switch", full: true },
      ]}
      toForm={(x) => ({ ...x, date: dateOnly(x.date) })}
      fromForm={(v, e) => ({ id: e?.id ?? `exp_${Date.now()}`, merchant: String(v.merchant), amount: Number(v.amount) || 0, category: v.category as Expense["category"], date: new Date(String(v.date)).toISOString(), receipt: Boolean(v.receipt), employee: e?.employee ?? currentUser.name, status: e?.status ?? "submitted" })}
    />
  );
}
