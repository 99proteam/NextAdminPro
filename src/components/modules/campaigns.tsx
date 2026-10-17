"use client";

import { Copy, DollarSign, Megaphone, MousePointerClick, Pause, Play, Send, Users } from "lucide-react";
import { campaigns, type Campaign } from "@/lib/data/modules";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import { CrudPage, dateOnly } from "@/components/crud/crud-page";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const channels: Campaign["channel"][] = ["Email", "SMS", "Push", "Social"];
const audiences = ["All subscribers", "VIP customers", "New sign-ups", "Inactive 90d", "Cart abandoners", "Enterprise accounts"];
const sent = (c: Campaign) => c.status === "sent" || c.status === "sending";

export function CampaignsModule() {
  return (
    <CrudPage<Campaign>
      title="Campaigns"
      description="Email, SMS and push campaigns with open, click and revenue tracking."
      entity="campaign"
      initial={campaigns}
      exportName="campaigns"
      initialSort={{ id: "sendAt", desc: true }}
      searchText={(c) => `${c.name} ${c.audience} ${c.channel}`}
      stats={[
        { label: "Messages sent", icon: Send, value: (r) => formatNumber(r.filter(sent).reduce((a, c) => a + c.recipients, 0), true) },
        { label: "Avg. open rate", icon: Users, value: (r) => { const s = r.filter(sent); return s.length ? `${(s.reduce((a, c) => a + c.openRate, 0) / s.length).toFixed(1)}%` : "—"; } },
        { label: "Avg. click rate", icon: MousePointerClick, value: (r) => { const s = r.filter(sent); return s.length ? `${(s.reduce((a, c) => a + c.clickRate, 0) / s.length).toFixed(1)}%` : "—"; } },
        { label: "Attributed revenue", icon: DollarSign, tone: () => "success", value: (r) => formatCurrency(r.reduce((a, c) => a + c.revenue, 0), "USD", true) },
      ]}
      filters={[
        { id: "status", label: "Status", value: (c) => c.status, options: ["draft", "scheduled", "sending", "sent", "paused"].map((s) => ({ label: s[0].toUpperCase() + s.slice(1), value: s })) },
        { id: "channel", label: "Channel", value: (c) => c.channel, options: channels.map((c) => ({ label: c, value: c })) },
      ]}
      columns={[
        { id: "name", header: "Campaign", hideable: false, sortValue: (c) => c.name, cell: (c) => <div className="flex items-center gap-3"><span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><Megaphone className="size-4" /></span><div><p className="font-medium">{c.name}</p><p className="text-xs text-muted-foreground">{c.audience} · {formatNumber(c.recipients)} recipients</p></div></div> },
        { id: "channel", header: "Channel", sortValue: (c) => c.channel, cell: (c) => <Badge variant="outline">{c.channel}</Badge> },
        { id: "status", header: "Status", sortValue: (c) => c.status, cell: (c) => <StatusBadge status={c.status} /> },
        { id: "open", header: "Opens", sortValue: (c) => c.openRate, exportValue: (c) => `${c.openRate}%`, cell: (c) => (sent(c) ? <div className="w-24"><span className="text-xs tabular">{c.openRate}%</span><Progress value={c.openRate} className="mt-1 h-1.5" /></div> : <span className="text-muted-foreground">—</span>) },
        { id: "click", header: "Clicks", sortValue: (c) => c.clickRate, exportValue: (c) => `${c.clickRate}%`, cell: (c) => (sent(c) ? <span className="tabular">{c.clickRate}%</span> : <span className="text-muted-foreground">—</span>) },
        { id: "revenue", header: "Revenue", sortValue: (c) => c.revenue, cell: (c) => <span className="tabular">{c.revenue ? formatCurrency(c.revenue, "USD") : "—"}</span> },
        { id: "sendAt", header: "Send date", sortValue: (c) => c.sendAt, exportValue: (c) => dateOnly(c.sendAt), cell: (c) => <span className="text-muted-foreground">{formatDate(c.sendAt)}</span> },
      ]}
      rowActions={[
        { label: "Send now", icon: Send, hidden: (c) => c.status !== "draft" && c.status !== "scheduled", onSelect: (c, api) => api.update(c.id, { status: "sending", sendAt: new Date().toISOString() }, `Sending “${c.name}”`) },
        { label: "Pause", icon: Pause, hidden: (c) => c.status !== "sending" && c.status !== "scheduled", onSelect: (c, api) => api.update(c.id, { status: "paused" }, "Campaign paused") },
        { label: "Resume", icon: Play, hidden: (c) => c.status !== "paused", onSelect: (c, api) => api.update(c.id, { status: "sending" }, "Campaign resumed") },
        { label: "Duplicate", icon: Copy, onSelect: (c, api) => api.add({ ...c, id: `cmp_${Date.now()}`, name: `${c.name} (copy)`, status: "draft", openRate: 0, clickRate: 0, revenue: 0 }) },
      ]}
      fields={[
        { name: "name", label: "Campaign name", required: true, full: true },
        { name: "channel", label: "Channel", type: "select", options: channels },
        { name: "audience", label: "Audience", type: "select", options: audiences },
        { name: "recipients", label: "Recipients", type: "number" },
        { name: "sendAt", label: "Send date", type: "date" },
        { name: "status", label: "Status", type: "select", options: ["draft", "scheduled"] },
      ]}
      toForm={(c) => ({ ...c, sendAt: dateOnly(c.sendAt) })}
      fromForm={(v, e) => ({ id: e?.id ?? `cmp_${Date.now()}`, name: String(v.name), channel: v.channel as Campaign["channel"], audience: String(v.audience), recipients: Number(v.recipients) || 0, sendAt: v.sendAt ? new Date(String(v.sendAt)).toISOString() : new Date().toISOString(), status: v.status as Campaign["status"], openRate: e?.openRate ?? 0, clickRate: e?.clickRate ?? 0, revenue: e?.revenue ?? 0 })}
    />
  );
}
