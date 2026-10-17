import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, DollarSign, ShoppingBag, TrendingUp, Users } from "lucide-react";
import { auditLogs, customers, orders, products, revenueByMonth, salesByCategory } from "@/lib/data";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { formatRelative } from "@/lib/time";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { DownloadReportButton } from "@/components/dashboard/download-report";
import { StatusBadge } from "@/components/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CategoryBarChart, RevenueAreaChart } from "@/components/charts/charts";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  const thisMonth = revenueByMonth.at(-1)!;
  const prevMonth = revenueByMonth.at(-2)!;
  const totalRevenue = revenueByMonth.reduce((a, m) => a + m.revenue, 0);
  const activeCustomers = customers.filter((c) => c.status === "active").length;
  const topProducts = [...products].sort((a, b) => b.sold * b.price - a.sold * a.price).slice(0, 5);
  const maxProductRevenue = topProducts[0].sold * topProducts[0].price;
  const recentOrders = orders.slice(0, 6);
  const avgOrder = orders.reduce((a, o) => a + o.total, 0) / orders.length;

  return (
    <>
      <PageHeader
        title="Welcome back, Alex 👋"
        description="Here’s what’s happening with your business today."
        actions={
          <>
            <DownloadReportButton />
            <Button asChild size="sm">
              <Link href="/dashboard/analytics">
                <TrendingUp /> View analytics
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue (Oct)" value={formatCurrency(thisMonth.revenue, "USD")} change={((thisMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100} icon={DollarSign} />
        <StatCard label="Orders" value={formatNumber(orders.length * 9)} change={8.2} icon={ShoppingBag} />
        <StatCard label="Active customers" value={formatNumber(activeCustomers * 37)} change={4.6} icon={Users} />
        <StatCard label="Avg. order value" value={formatCurrency(avgOrder)} change={-1.3} icon={TrendingUp} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex-row items-start justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle>Revenue overview</CardTitle>
              <CardDescription>
                {formatCurrency(totalRevenue, "USD", true)} in the last 12 months
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <RevenueAreaChart data={revenueByMonth} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sales by category</CardTitle>
            <CardDescription>Lifetime revenue per product category</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryBarChart data={salesByCategory} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle>Recent orders</CardTitle>
              <CardDescription>Latest transactions across all channels</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/orders">
                View all <ArrowRight />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="px-0">
            <ul className="divide-y">
              {recentOrders.map((o) => (
                <li key={o.id}>
                  <Link href={`/dashboard/orders/${o.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/50">
                    <Avatar name={o.customerName} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{o.customerName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {o.number} · {o.items.length} item{o.items.length > 1 ? "s" : ""} · {formatRelative(o.createdAt)}
                      </p>
                    </div>
                    <div className="hidden sm:block">
                      <StatusBadge status={o.status} />
                    </div>
                    <p className="w-24 text-right text-sm font-medium tabular">{formatCurrency(o.total)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Top products</CardTitle>
              <CardDescription>By lifetime revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-4">
                {topProducts.map((p) => (
                  <li key={p.id} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate">{p.name}</span>
                      <span className="font-medium tabular">{formatCurrency(p.sold * p.price, "USD", true)}</span>
                    </div>
                    <Progress value={((p.sold * p.price) / maxProductRevenue) * 100} />
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="relative flex flex-col gap-4 border-l pl-4">
                {auditLogs.slice(0, 5).map((l) => (
                  <li key={l.id} className="relative text-sm">
                    <span className="absolute -left-[21px] top-1.5 size-2.5 rounded-full border-2 border-card bg-primary" />
                    <p>
                      <span className="font-medium">{l.actor}</span> <span className="text-muted-foreground">{l.action}</span> {l.resource}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatRelative(l.createdAt)}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
