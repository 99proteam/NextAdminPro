"use client";

import { ArrowDownLeft, ArrowUpRight, Banknote, CircleAlert, CreditCard, RotateCcw } from "lucide-react";
import { transactions, type Transaction } from "@/lib/data/modules";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { CrudPage } from "@/components/crud/crud-page";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";

export function TransactionsModule() {
  return (
    <CrudPage<Transaction>
      title="Transactions"
      description="Every charge, refund, fee and payout across payment methods."
      entity="transaction"
      initial={transactions}
      exportName="transactions"
      pageSize={20}
      initialSort={{ id: "date", desc: true }}
      searchText={(t) => `${t.id} ${t.description} ${t.customer} ${t.method}`}
      stats={[
        { label: "Gross volume", icon: ArrowDownLeft, value: (r) => formatCurrency(r.filter((t) => t.type === "charge" && t.status === "succeeded").reduce((a, t) => a + t.amount, 0)) },
        { label: "Refunds", icon: RotateCcw, value: (r) => formatCurrency(Math.abs(r.filter((t) => t.type === "refund").reduce((a, t) => a + t.amount, 0))) },
        { label: "Payouts", icon: Banknote, value: (r) => formatCurrency(Math.abs(r.filter((t) => t.type === "payout").reduce((a, t) => a + t.amount, 0))) },
        { label: "Failed payments", icon: CircleAlert, tone: (r) => (r.some((t) => t.status === "failed") ? "destructive" : "default"), value: (r) => String(r.filter((t) => t.status === "failed").length) },
      ]}
      filters={[
        { id: "type", label: "Type", value: (t) => t.type, options: ["charge", "refund", "payout", "fee"].map((v) => ({ label: v[0].toUpperCase() + v.slice(1), value: v })) },
        { id: "status", label: "Status", value: (t) => t.status, options: ["succeeded", "pending", "failed"].map((v) => ({ label: v[0].toUpperCase() + v.slice(1), value: v })) },
        { id: "method", label: "Method", value: (t) => t.method, options: ["Visa", "Mastercard", "Amex", "PayPal", "Apple Pay", "Bank transfer"].map((v) => ({ label: v, value: v })) },
      ]}
      columns={[
        { id: "description", header: "Transaction", hideable: false, sortValue: (t) => t.description, cell: (t) => (
          <div className="flex items-center gap-3">
            <span className={cn("flex size-8 items-center justify-center rounded-full", t.amount >= 0 ? "bg-success/10 text-success" : "bg-muted text-muted-foreground")}>
              {t.amount >= 0 ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
            </span>
            <div><p className="font-medium">{t.description}</p><p className="font-mono text-xs text-muted-foreground">{t.id}</p></div>
          </div>
        ) },
        { id: "customer", header: "Customer", sortValue: (t) => t.customer, cell: (t) => <span className="text-muted-foreground">{t.customer}</span> },
        { id: "method", header: "Method", sortValue: (t) => t.method, cell: (t) => <span className="inline-flex items-center gap-1.5"><CreditCard className="size-3.5 text-muted-foreground" />{t.method}</span> },
        { id: "type", header: "Type", sortValue: (t) => t.type, cell: (t) => <Badge variant="outline" className="capitalize">{t.type}</Badge> },
        { id: "status", header: "Status", sortValue: (t) => t.status, cell: (t) => <StatusBadge status={t.status} /> },
        { id: "date", header: "Date", sortValue: (t) => t.date, exportValue: (t) => t.date, cell: (t) => <span className="text-muted-foreground">{formatDate(t.date, { dateStyle: "medium", timeStyle: "short" })}</span> },
        { id: "amount", header: "Amount", sortValue: (t) => t.amount, className: "text-right", headClassName: "text-right", cell: (t) => <span className={cn("font-medium tabular", t.amount >= 0 ? "text-success" : "")}>{t.amount >= 0 ? "+" : "−"}{formatCurrency(Math.abs(t.amount))}</span> },
      ]}
      rowActions={[
        { label: "Refund", icon: RotateCcw, hidden: (t) => t.type !== "charge" || t.status !== "succeeded", onSelect: (t, api) => api.add({ ...t, id: `txn_rf_${Date.now()}`, type: "refund", amount: -t.amount, description: `Refund for ${t.description}`, date: new Date().toISOString() }) },
      ]}
    />
  );
}
