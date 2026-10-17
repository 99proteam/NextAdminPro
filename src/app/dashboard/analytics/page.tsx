import type { Metadata } from "next";
import { Clock, Eye, MousePointerClick, UserPlus } from "lucide-react";
import { dailyTraffic, deviceSplit, funnel, topCountries, trafficSources } from "@/lib/data";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { DateRangePicker } from "@/components/dashboard/date-range";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DeviceDonut, RevenueExpensesChart, SignupsBarChart, TrafficLineChart } from "@/components/charts/charts";
import { revenueByMonth } from "@/lib/data";

export const metadata: Metadata = { title: "Analytics" };

// Ordinal single-hue ramp for funnel stages (light → dark = later stage)
const funnelSteps = ["#86b6ef", "#5598e7", "#2a78d6", "#1c5cab", "#184f95"];

export default function AnalyticsPage() {
  const visitors = dailyTraffic.reduce((a, d) => a + d.visitors, 0);
  const pageViews = dailyTraffic.reduce((a, d) => a + d.pageViews, 0);
  const signups = dailyTraffic.reduce((a, d) => a + d.signups, 0);
  const totalSources = trafficSources.reduce((a, s) => a + s.visitors, 0);
  const maxCountry = topCountries[0].visitors;

  return (
    <>
      <PageHeader title="Analytics" description="Traffic, conversion and revenue performance." actions={<DateRangePicker />} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Unique visitors" value={formatNumber(visitors)} change={12.4} icon={Eye} hint="vs previous 30 days" />
        <StatCard label="Page views" value={formatNumber(pageViews)} change={9.1} icon={MousePointerClick} hint="vs previous 30 days" />
        <StatCard label="Sign-ups" value={formatNumber(signups)} change={18.7} icon={UserPlus} hint="vs previous 30 days" />
        <StatCard label="Bounce rate" value="38.2%" change={-2.4} invert icon={Clock} hint="vs previous 30 days" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Traffic</CardTitle>
            <CardDescription>Daily visitors and page views, last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <TrafficLineChart data={dailyTraffic} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Devices</CardTitle>
            <CardDescription>Share of sessions by device type</CardDescription>
          </CardHeader>
          <CardContent>
            <DeviceDonut data={deviceSplit} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Conversion funnel</CardTitle>
            <CardDescription>From first visit to completed purchase</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="flex flex-col gap-3">
              {funnel.map((f, i) => {
                const pct = (f.value / funnel[0].value) * 100;
                const step = i > 0 ? (f.value / funnel[i - 1].value) * 100 : null;
                return (
                  <li key={f.stage} className="grid grid-cols-[120px_1fr_auto] items-center gap-3 text-sm sm:grid-cols-[150px_1fr_auto]">
                    <span className="truncate text-muted-foreground">{f.stage}</span>
                    <div className="h-7 rounded-md bg-muted">
                      <div className="h-full rounded-md" style={{ width: `${Math.max(pct, 2)}%`, background: funnelSteps[i] }} />
                    </div>
                    <span className="w-28 text-right tabular">
                      <span className="font-medium">{formatNumber(f.value, true)}</span>
                      {step != null && <span className="ml-1.5 text-xs text-muted-foreground">{step.toFixed(0)}%</span>}
                    </span>
                  </li>
                );
              })}
            </ol>
            <p className="mt-4 text-sm text-muted-foreground">
              Overall conversion rate <span className="font-medium text-foreground">{((funnel.at(-1)!.value / funnel[0].value) * 100).toFixed(2)}%</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Revenue vs expenses</CardTitle>
            <CardDescription>Monthly, last 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueExpensesChart data={revenueByMonth} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Traffic sources</CardTitle>
            <CardDescription>Where your visitors come from</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-3.5">
              {trafficSources.map((s) => (
                <li key={s.source} className="text-sm">
                  <div className="mb-1.5 flex justify-between">
                    <span>{s.source}</span>
                    <span className="tabular text-muted-foreground">
                      <span className="font-medium text-foreground">{formatNumber(s.visitors, true)}</span> · {((s.visitors / totalSources) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div className="h-full rounded-full bg-chart-1" style={{ width: `${(s.visitors / trafficSources[0].visitors) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top countries</CardTitle>
            <CardDescription>Visitors and revenue by country</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-2">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-5">Country</TableHead>
                  <TableHead>Visitors</TableHead>
                  <TableHead className="hidden sm:table-cell">Share</TableHead>
                  <TableHead className="pr-5 text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCountries.map((c) => (
                  <TableRow key={c.code}>
                    <TableCell className="pl-5">
                      <span className="mr-2 inline-flex w-7 justify-center rounded bg-muted py-0.5 text-[10px] font-semibold text-muted-foreground">{c.code}</span>
                      {c.country}
                    </TableCell>
                    <TableCell className="tabular">{formatNumber(c.visitors)}</TableCell>
                    <TableCell className="hidden w-1/3 sm:table-cell">
                      <div className="h-2 rounded-full bg-muted">
                        <div className="h-full rounded-full bg-chart-1" style={{ width: `${(c.visitors / maxCountry) * 100}%` }} />
                      </div>
                    </TableCell>
                    <TableCell className="pr-5 text-right font-medium tabular">{formatCurrency(c.revenue, "USD")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Daily sign-ups</CardTitle>
          <CardDescription>New accounts created per day</CardDescription>
        </CardHeader>
        <CardContent>
          <SignupsBarChart data={dailyTraffic} />
        </CardContent>
      </Card>
    </>
  );
}
