"use client";

import { AlertTriangle, Ban, RefreshCw, Repeat, TrendingUp, Users } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { mrrHistory, subscriptions, type Subscription } from "@/lib/data/modules";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CrudPage, dateOnly } from "@/components/crud/crud-page";
import { axisProps, ChartTooltip } from "@/components/charts/chart-tooltip";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const live = (s: Subscription) => s.status === "active" || s.status === "past-due";

export function SubscriptionsModule() {
  return (
    <CrudPage<Subscription>
      title="Subscriptions"
      description="Recurring revenue, plans, seats and renewals."
      entity="subscription"
      initial={subscriptions}
      exportName="subscriptions"
      initialSort={{ id: "mrr", desc: true }}
      searchText={(s) => `${s.customer} ${s.email} ${s.plan}`}
      stats={[
        { label: "MRR", icon: TrendingUp, value: (r) => formatCurrency(r.filter(live).reduce((a, s) => a + s.mrr, 0), "USD"), hint: () => "+9.4% vs last month" },
        { label: "ARR", icon: Repeat, value: (r) => formatCurrency(r.filter(live).reduce((a, s) => a + s.mrr, 0) * 12, "USD", true) },
        { label: "Active subscribers", icon: Users, value: (r) => String(r.filter((s) => s.status === "active").length), hint: (r) => `${r.filter((s) => s.status === "trialing").length} trialing` },
        { label: "Churn (30d)", icon: AlertTriangle, tone: () => "warning", value: (r) => `${((r.filter((s) => s.status === "cancelled").length / r.length) * 100).toFixed(1)}%` },
      ]}
      filters={[
        { id: "status", label: "Status", value: (s) => s.status, options: ["active", "trialing", "past-due", "cancelled"].map((v) => ({ label: v.replace("-", " "), value: v })) },
        { id: "plan", label: "Plan", value: (s) => s.plan, options: ["Starter", "Pro", "Business", "Enterprise"].map((v) => ({ label: v, value: v })) },
        { id: "interval", label: "Billing", value: (s) => s.interval, options: [{ label: "Monthly", value: "monthly" }, { label: "Yearly", value: "yearly" }] },
      ]}
      columns={[
        { id: "customer", header: "Customer", hideable: false, sortValue: (s) => s.customer, cell: (s) => <div><p className="font-medium">{s.customer}</p><p className="text-xs text-muted-foreground">{s.email}</p></div> },
        { id: "plan", header: "Plan", sortValue: (s) => s.plan, cell: (s) => <Badge variant="outline">{s.plan}</Badge> },
        { id: "interval", header: "Billing", sortValue: (s) => s.interval, cell: (s) => <span className="capitalize text-muted-foreground">{s.interval}</span> },
        { id: "seats", header: "Seats", sortValue: (s) => s.seats, cell: (s) => <span className="tabular">{s.seats}</span> },
        { id: "mrr", header: "MRR", sortValue: (s) => s.mrr, cell: (s) => <span className="font-medium tabular">{formatCurrency(s.mrr, "USD")}</span> },
        { id: "status", header: "Status", sortValue: (s) => s.status, cell: (s) => <StatusBadge status={s.status} /> },
        { id: "renews", header: "Renews", sortValue: (s) => s.renews, exportValue: (s) => dateOnly(s.renews), cell: (s) => <span className="text-muted-foreground">{s.status === "cancelled" ? "—" : formatDate(s.renews)}</span> },
      ]}
      rowActions={[
        { label: "Retry payment", icon: RefreshCw, hidden: (s) => s.status !== "past-due", onSelect: (s, api) => api.update(s.id, { status: "active" }, "Payment succeeded") },
        { label: "Cancel subscription", icon: Ban, destructive: true, hidden: (s) => s.status === "cancelled", onSelect: (s, api) => api.update(s.id, { status: "cancelled" }, "Subscription cancelled") },
      ]}
      bulkActions={[{ label: "Cancel", icon: Ban, apply: () => ({ status: "cancelled" }), destructive: true }]}
    >
      {() => (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>MRR growth</CardTitle>
            <CardDescription>Monthly recurring revenue, last 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mrrHistory} margin={{ left: -8, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="mrr-fill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.22} />
                      <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
                  <XAxis dataKey="month" {...axisProps} />
                  <YAxis tickFormatter={(v) => formatCurrency(v, "USD", true)} width={56} {...axisProps} />
                  <Tooltip cursor={{ stroke: "var(--chart-axis)", strokeDasharray: "3 3" }} content={<ChartTooltip valueFormat={(v) => formatCurrency(v)} />} />
                  <Area type="monotone" dataKey="mrr" name="MRR" stroke="var(--chart-1)" strokeWidth={2} fill="url(#mrr-fill)" activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--chart-surface)" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </CrudPage>
  );
}
