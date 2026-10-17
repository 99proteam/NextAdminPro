"use client";

import * as React from "react";
import { CalendarClock, Download, FileBarChart, FileSpreadsheet, FileText, Loader2, Mail, Play, Plus } from "lucide-react";
import { toast } from "sonner";
import type { Report } from "@/lib/data";
import { orders, revenueByMonth } from "@/lib/data";
import { cn, downloadCsv, formatCurrency, formatNumber } from "@/lib/utils";
import { formatRelative } from "@/lib/time";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormField } from "@/components/form-helpers";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DateRangePicker } from "@/components/dashboard/date-range";

const categories = ["All", "Sales", "Customers", "Inventory", "Finance", "Marketing"] as const;
const formatIcon = { CSV: FileSpreadsheet, XLSX: FileSpreadsheet, PDF: FileText };

export function ReportsView({ initial }: { initial: Report[] }) {
  const [reports, setReports] = React.useState(initial);
  const [category, setCategory] = React.useState<(typeof categories)[number]>("All");
  const [running, setRunning] = React.useState<string | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const shown = category === "All" ? reports : reports.filter((r) => r.category === category);

  const run = (r: Report) => {
    setRunning(r.id);
    setTimeout(() => {
      setRunning(null);
      setReports((list) => list.map((x) => (x.id === r.id ? { ...x, lastRunAt: new Date().toISOString() } : x)));
      if (r.category === "Sales") downloadCsv(`${r.name.toLowerCase().replace(/\s+/g, "-")}.csv`, revenueByMonth);
      else downloadCsv(`${r.name.toLowerCase().replace(/\s+/g, "-")}.csv`, orders.slice(0, 50).map((o) => ({ order: o.number, customer: o.customerName, status: o.status, total: o.total, date: o.createdAt.slice(0, 10) })));
      toast.success(`“${r.name}” generated`, { description: "Your download has started." });
    }, 900);
  };

  // Profit & loss summary for the current fiscal year
  const ytd = revenueByMonth.slice(-10);
  const revenue = ytd.reduce((a, m) => a + m.revenue, 0);
  const expenses = ytd.reduce((a, m) => a + m.expenses, 0);
  const cogs = Math.round(revenue * 0.38);
  const opex = expenses - cogs;

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">Generate, schedule and email business reports.</p>
        </div>
        <div className="flex gap-2">
          <DateRangePicker defaultValue="Year to date" />
          <Button onClick={() => setCreateOpen(true)}><Plus /> New report</Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <Card>
          <div className="flex gap-1 overflow-x-auto border-b p-2">
            {categories.map((c) => (
              <Button key={c} size="sm" variant={category === c ? "secondary" : "ghost"} onClick={() => setCategory(c)}>{c}</Button>
            ))}
          </div>
          <ul className="divide-y">
            {shown.map((r) => {
              const Icon = formatIcon[r.format];
              return (
                <li key={r.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><FileBarChart className="size-5" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 font-medium">
                      {r.name} <Badge variant="outline">{r.category}</Badge>
                    </p>
                    <p className="text-sm text-muted-foreground">{r.description}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Icon className="size-3.5" /> {r.format}</span>
                      <span className="inline-flex items-center gap-1"><CalendarClock className="size-3.5" /> {r.schedule === "none" ? "On demand" : `Runs ${r.schedule}`}</span>
                      <span className="inline-flex items-center gap-1"><Mail className="size-3.5" /> {r.recipients} recipient{r.recipients > 1 ? "s" : ""}</span>
                      <span>Last run {formatRelative(r.lastRunAt)}</span>
                    </p>
                  </div>
                  <div className="flex gap-2 self-end sm:self-auto">
                    <Select
                      value={r.schedule}
                      onValueChange={(v) => {
                        setReports((list) => list.map((x) => (x.id === r.id ? { ...x, schedule: v as Report["schedule"] } : x)));
                        toast.success(v === "none" ? "Schedule removed" : `Scheduled ${v}`);
                      }}
                    >
                      <SelectTrigger className="h-8 w-32" aria-label={`Schedule for ${r.name}`}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">On demand</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="sm" onClick={() => run(r)} disabled={running === r.id}>
                      {running === r.id ? <Loader2 className="animate-spin" /> : <Play />} Run
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card className="self-start">
          <CardHeader className="flex-row items-start justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle>Profit &amp; loss</CardTitle>
              <CardDescription>Fiscal year to date</CardDescription>
            </div>
            <Button variant="ghost" size="icon-sm" aria-label="Download P&L" onClick={() => downloadCsv("profit-and-loss.csv", [{ revenue, cogs, grossProfit: revenue - cogs, operatingExpenses: opex, netProfit: revenue - expenses }])}>
              <Download />
            </Button>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col text-sm">
              {[
                ["Revenue", revenue, false],
                ["Cost of goods sold", -cogs, false],
                ["Gross profit", revenue - cogs, true],
                ["Operating expenses", -opex, false],
                ["Net profit", revenue - expenses, true],
              ].map(([label, value, strong]) => (
                <div key={label as string} className={cn("flex justify-between py-2", strong && "border-t font-semibold")}>
                  <dt className={cn(!strong && "text-muted-foreground")}>{label}</dt>
                  <dd className="tabular">{formatCurrency(value as number)}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-2 text-xs text-muted-foreground">Net margin {(((revenue - expenses) / revenue) * 100).toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Monthly performance</CardTitle>
          <CardDescription>Revenue, expenses and profit by month</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-5">Month</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Expenses</TableHead>
                <TableHead className="text-right">Profit</TableHead>
                <TableHead className="text-right">Margin</TableHead>
                <TableHead className="pr-5 text-right">vs last year</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {revenueByMonth.map((m) => {
                const profit = m.revenue - m.expenses;
                const yoy = ((m.revenue - m.lastYear) / m.lastYear) * 100;
                return (
                  <TableRow key={m.month}>
                    <TableCell className="pl-5 font-medium">{m.month}</TableCell>
                    <TableCell className="text-right tabular">{formatCurrency(m.revenue)}</TableCell>
                    <TableCell className="text-right tabular text-muted-foreground">{formatCurrency(m.expenses)}</TableCell>
                    <TableCell className="text-right font-medium tabular">{formatCurrency(profit)}</TableCell>
                    <TableCell className="text-right tabular">{formatNumber((profit / m.revenue) * 100)}%</TableCell>
                    <TableCell className={cn("pr-5 text-right tabular", yoy >= 0 ? "text-success" : "text-destructive")}>{yoy >= 0 ? "+" : ""}{yoy.toFixed(1)}%</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New report</DialogTitle>
            <DialogDescription>Build a custom report and optionally email it on a schedule.</DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
              if (!f.name.trim()) return toast.error("Report name is required");
              setReports((l) => [{ id: `rpt_new_${l.length}`, name: f.name, description: f.description || "Custom report", category: f.category as Report["category"], schedule: f.schedule as Report["schedule"], format: f.format as Report["format"], lastRunAt: new Date().toISOString(), recipients: 1 }, ...l]);
              setCreateOpen(false);
              toast.success("Report created");
            }}
          >
            <div className="sm:col-span-2"><FormField label="Name" name="name" placeholder="e.g. Regional sales" autoFocus /></div>
            <div className="sm:col-span-2"><FormField label="Description" name="description" placeholder="What does this report show?" /></div>
            {[
              ["category", "Category", ["Sales", "Customers", "Inventory", "Finance", "Marketing"], "Sales"],
              ["format", "Format", ["CSV", "XLSX", "PDF"], "CSV"],
              ["schedule", "Schedule", ["none", "daily", "weekly", "monthly"], "none"],
            ].map(([name, label, opts, def]) => (
              <div key={name as string} className="flex flex-col gap-1.5">
                <Label>{label as string}</Label>
                <Select name={name as string} defaultValue={def as string}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{(opts as string[]).map((o) => <SelectItem key={o} value={o} className="capitalize">{o === "none" ? "On demand" : o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            ))}
            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit">Create report</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
