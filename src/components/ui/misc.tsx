import * as React from "react";
import { Loader2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className, label = "Loading" }: { className?: string; label?: string }) {
  return <Loader2 className={cn("size-5 animate-spin text-primary", className)} aria-label={label} role="status" />;
}

export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return <kbd className={cn("inline-flex h-5 min-w-5 items-center justify-center rounded border bg-muted px-1.5 font-sans text-[11px] font-medium text-muted-foreground shadow-[0_1px_0_var(--border)]", className)}>{children}</kbd>;
}

export function EmptyState({ icon: Icon, title, description, action, className }: { icon: LucideIcon; title: string; description?: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-10 text-center", className)}>
      <span className="flex size-12 items-center justify-center rounded-full bg-muted"><Icon className="size-5 text-muted-foreground" /></span>
      <div>
        <p className="font-medium">{title}</p>
        {description && <p className="mt-0.5 max-w-sm text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/** Tiny inline SVG trend line for stat tiles (no chart library needed). */
export function MiniSparkline({ data, className }: { data: number[]; className?: string }) {
  const w = 96;
  const h = 32;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - 3 - ((v - min) / (max - min || 1)) * (h - 6)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={cn("h-8 w-24", className)} aria-hidden>
      <polyline points={pts} fill="none" stroke="var(--chart-1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AvatarGroup({ children, max = 4, className }: { children: React.ReactNode[]; max?: number; className?: string }) {
  const shown = children.slice(0, max);
  const extra = children.length - shown.length;
  return (
    <div className={cn("flex -space-x-2 [&>*]:ring-2 [&>*]:ring-card", className)}>
      {shown}
      {extra > 0 && <span className="relative flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">+{extra}</span>}
    </div>
  );
}
