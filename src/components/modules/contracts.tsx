"use client";

import { Clock, FileSignature, FileText, PenLine, Send, ShieldCheck } from "lucide-react";
import { contracts, type Contract } from "@/lib/data/modules";
import { NOW } from "@/lib/data/seed";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CrudPage, dateOnly } from "@/components/crud/crud-page";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";

const types: Contract["type"][] = ["Customer", "Vendor", "NDA", "Employment", "Partnership"];
const statuses: Contract["status"][] = ["draft", "sent", "signed", "expired", "declined"];
const expiringSoon = (c: Contract) => c.status === "signed" && new Date(c.end).getTime() - NOW < 60 * 86_400_000;

export function ContractsModule() {
  return (
    <CrudPage<Contract>
      title="Contracts"
      description="Agreements, e-signature status, renewals and expirations."
      entity="contract"
      initial={contracts}
      exportName="contracts"
      initialSort={{ id: "end", desc: false }}
      searchText={(c) => `${c.title} ${c.party} ${c.type} ${c.owner}`}
      stats={[
        { label: "Active contracts", icon: ShieldCheck, value: (r) => String(r.filter((c) => c.status === "signed").length) },
        { label: "Contract value", icon: FileText, value: (r) => formatCurrency(r.filter((c) => c.status === "signed").reduce((a, c) => a + c.value, 0), "USD", true) },
        { label: "Awaiting signature", icon: PenLine, tone: () => "warning", value: (r) => String(r.filter((c) => c.status === "sent").length) },
        { label: "Expiring in 60 days", icon: Clock, tone: (r) => (r.some(expiringSoon) ? "destructive" : "default"), value: (r) => String(r.filter(expiringSoon).length) },
      ]}
      filters={[
        { id: "status", label: "Status", value: (c) => c.status, options: statuses.map((s) => ({ label: s[0].toUpperCase() + s.slice(1), value: s })) },
        { id: "type", label: "Type", value: (c) => c.type, options: types.map((t) => ({ label: t, value: t })) },
      ]}
      columns={[
        { id: "title", header: "Contract", hideable: false, sortValue: (c) => c.title, cell: (c) => <div className="flex items-center gap-3"><span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><FileSignature className="size-4" /></span><div><p className="font-medium">{c.title}</p><p className="text-xs text-muted-foreground">Owner: {c.owner}</p></div></div> },
        { id: "type", header: "Type", sortValue: (c) => c.type, cell: (c) => <Badge variant="outline">{c.type}</Badge> },
        { id: "value", header: "Value", sortValue: (c) => c.value, cell: (c) => <span className="tabular">{c.value ? formatCurrency(c.value, "USD") : "—"}</span> },
        { id: "start", header: "Start", sortValue: (c) => c.start, exportValue: (c) => dateOnly(c.start), cell: (c) => <span className="text-muted-foreground">{formatDate(c.start)}</span> },
        { id: "end", header: "End", sortValue: (c) => c.end, exportValue: (c) => dateOnly(c.end), cell: (c) => <span className={expiringSoon(c) ? "font-medium text-destructive" : "text-muted-foreground"}>{formatDate(c.end)}{c.autoRenew && <span className="ml-1 text-xs text-muted-foreground">(auto-renew)</span>}</span> },
        { id: "status", header: "Status", sortValue: (c) => statuses.indexOf(c.status), exportValue: (c) => c.status, cell: (c) => <StatusBadge status={c.status} /> },
      ]}
      rowActions={[
        { label: "Send for signature", icon: Send, hidden: (c) => c.status !== "draft", onSelect: (c, api) => api.update(c.id, { status: "sent" }, `Sent to ${c.party} for e-signature`) },
        { label: "Mark signed", icon: PenLine, hidden: (c) => c.status !== "sent", onSelect: (c, api) => api.update(c.id, { status: "signed" }, "Contract signed ✍️") },
      ]}
      fields={[
        { name: "title", label: "Title", required: true, full: true },
        { name: "party", label: "Counterparty", required: true },
        { name: "type", label: "Type", type: "select", options: types },
        { name: "value", label: "Value (USD)", type: "number" },
        { name: "status", label: "Status", type: "select", options: statuses },
        { name: "start", label: "Start date", type: "date" },
        { name: "end", label: "End date", type: "date" },
        { name: "autoRenew", label: "Auto-renew", type: "switch", full: true },
      ]}
      toForm={(c) => ({ ...c, start: dateOnly(c.start), end: dateOnly(c.end) })}
      fromForm={(v, e) => ({ id: e?.id ?? `ctr_${Date.now()}`, title: String(v.title), party: String(v.party), type: v.type as Contract["type"], value: Number(v.value) || 0, status: v.status as Contract["status"], start: v.start ? new Date(String(v.start)).toISOString() : new Date().toISOString(), end: v.end ? new Date(String(v.end)).toISOString() : new Date(Date.now() + 365 * 86_400_000).toISOString(), autoRenew: Boolean(v.autoRenew), owner: e?.owner ?? "Alex Morgan" })}
    />
  );
}
