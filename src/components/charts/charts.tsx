"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { axisProps, ChartLegend, ChartTooltip } from "./chart-tooltip";

const money = (v: number) => formatCurrency(v, "USD", true);
const grid = <CartesianGrid vertical={false} stroke="var(--chart-grid)" />;
const cursor = { stroke: "var(--chart-axis)", strokeDasharray: "3 3" };

export function RevenueAreaChart({ data }: { data: { month: string; revenue: number; lastYear: number }[] }) {
  return (
    <div className="flex flex-col gap-3">
      <ChartLegend
        items={[
          { label: "This year", color: "var(--chart-1)" },
          { label: "Last year", color: "var(--chart-axis)", dashed: true },
        ]}
      />
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: -8, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="rev-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.22} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            {grid}
            <XAxis dataKey="month" {...axisProps} />
            <YAxis tickFormatter={money} width={56} {...axisProps} />
            <Tooltip cursor={cursor} content={<ChartTooltip valueFormat={(v) => formatCurrency(v)} />} />
            <Area
              type="monotone"
              dataKey="lastYear"
              name="Last year"
              stroke="var(--chart-axis)"
              strokeDasharray="4 3"
              strokeWidth={2}
              fill="none"
              activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--chart-surface)" }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              name="This year"
              stroke="var(--chart-1)"
              strokeWidth={2}
              fill="url(#rev-fill)"
              activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--chart-surface)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function RevenueExpensesChart({ data }: { data: { month: string; revenue: number; expenses: number }[] }) {
  return (
    <div className="flex flex-col gap-3">
      <ChartLegend
        items={[
          { label: "Revenue", color: "var(--chart-1)" },
          { label: "Expenses", color: "var(--chart-2)" },
        ]}
      />
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: -8, right: 8, top: 8 }} barGap={2} barCategoryGap="28%">
            {grid}
            <XAxis dataKey="month" {...axisProps} />
            <YAxis tickFormatter={money} width={56} {...axisProps} />
            <Tooltip cursor={{ fill: "var(--muted)", opacity: 0.6 }} content={<ChartTooltip valueFormat={(v) => formatCurrency(v)} />} />
            <Bar dataKey="revenue" name="Revenue" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={18} />
            <Bar dataKey="expenses" name="Expenses" fill="var(--chart-2)" radius={[4, 4, 0, 0]} maxBarSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function CategoryBarChart({ data }: { data: { category: string; revenue: number }[] }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 48, top: 0, bottom: 0 }} barCategoryGap="22%">
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="category" width={84} {...axisProps} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
          <Tooltip cursor={{ fill: "var(--muted)", opacity: 0.6 }} content={<ChartTooltip valueFormat={(v) => formatCurrency(v)} />} />
          <Bar
            dataKey="revenue"
            name="Revenue"
            fill="var(--chart-1)"
            radius={[0, 4, 4, 0]}
            label={{ position: "right", fill: "var(--muted-foreground)", fontSize: 11, formatter: (v: unknown) => money(Number(v)) }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TrafficLineChart({ data }: { data: { label: string; visitors: number; pageViews: number }[] }) {
  return (
    <div className="flex flex-col gap-3">
      <ChartLegend
        items={[
          { label: "Page views", color: "var(--chart-1)" },
          { label: "Visitors", color: "var(--chart-3)" },
        ]}
      />
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: -8, right: 8, top: 8 }}>
            {grid}
            <XAxis dataKey="label" {...axisProps} interval={4} />
            <YAxis tickFormatter={(v) => formatNumber(v, true)} width={48} {...axisProps} />
            <Tooltip cursor={cursor} content={<ChartTooltip />} />
            <Line type="monotone" dataKey="pageViews" name="Page views" stroke="var(--chart-1)" strokeWidth={2} dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--chart-surface)" }} />
            <Line type="monotone" dataKey="visitors" name="Visitors" stroke="var(--chart-3)" strokeWidth={2} dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--chart-surface)" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function SignupsBarChart({ data }: { data: { label: string; signups: number }[] }) {
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: -16, right: 4, top: 8 }} barCategoryGap="20%">
          {grid}
          <XAxis dataKey="label" {...axisProps} interval={6} />
          <YAxis width={40} {...axisProps} />
          <Tooltip cursor={{ fill: "var(--muted)", opacity: 0.6 }} content={<ChartTooltip />} />
          <Bar dataKey="signups" name="Sign-ups" fill="var(--chart-1)" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const deviceColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"];

export function DeviceDonut({ data }: { data: { device: string; share: number }[] }) {
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row lg:flex-col xl:flex-row">
      <div className="relative h-44 w-44 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<ChartTooltip valueFormat={(v) => `${v}%`} />} />
            <Pie
              data={data}
              dataKey="share"
              nameKey="device"
              innerRadius="64%"
              outerRadius="100%"
              paddingAngle={2}
              stroke="var(--chart-surface)"
              strokeWidth={2}
            >
              {data.map((d, i) => (
                <Cell key={d.device} fill={deviceColors[i]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold">{data[0].share}%</span>
          <span className="text-xs text-muted-foreground">{data[0].device}</span>
        </div>
      </div>
      <ul className="flex w-full flex-col gap-2.5 text-sm">
        {data.map((d, i) => (
          <li key={d.device} className="flex items-center gap-2">
            <span className="size-2.5 rounded-sm" style={{ background: deviceColors[i] }} />
            <span className="text-muted-foreground">{d.device}</span>
            <span className="ml-auto font-medium tabular">{d.share}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Sparkline({ data, color = "var(--chart-1)" }: { data: number[]; color?: string }) {
  const points = data.map((v, i) => ({ i, v }));
  return (
    <div className="h-10 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 4, bottom: 4, left: 2, right: 2 }}>
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
