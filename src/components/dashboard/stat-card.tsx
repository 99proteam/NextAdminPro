import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn, formatPercent } from "@/lib/utils";

export function StatCard({
  label,
  value,
  change,
  icon: Icon,
  hint = "vs last month",
  invert = false,
}: {
  label: string;
  value: string;
  change?: number;
  icon: LucideIcon;
  hint?: string;
  /** Set when a decrease is good news (e.g. churn, refunds). */
  invert?: boolean;
}) {
  const up = (change ?? 0) >= 0;
  const good = invert ? !up : up;
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-3 text-[28px] font-semibold leading-none tracking-tight">{value}</p>
      {change != null && (
        <p className="mt-3 flex items-center gap-1.5 text-xs">
          <span className={cn("inline-flex items-center gap-0.5 font-medium", good ? "text-success" : "text-destructive")}>
            {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
            {formatPercent(change)}
          </span>
          <span className="text-muted-foreground">{hint}</span>
        </p>
      )}
    </Card>
  );
}
