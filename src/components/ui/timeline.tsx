import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TimelineItem {
  title: React.ReactNode;
  description?: React.ReactNode;
  time?: string;
  icon?: LucideIcon;
  tone?: "default" | "primary" | "success" | "warning" | "destructive";
}

const tones = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/12 text-warning",
  destructive: "bg-destructive/10 text-destructive",
};

export function Timeline({ items, className }: { items: TimelineItem[]; className?: string }) {
  return (
    <ol className={cn("relative flex flex-col gap-5", className)}>
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <li key={i} className="relative flex gap-3">
            {i < items.length - 1 && <span className="absolute left-4 top-9 h-[calc(100%-1rem)] w-px bg-border" aria-hidden />}
            <span className={cn("relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full ring-4 ring-card", tones[item.tone ?? "default"])}>
              {Icon ? <Icon className="size-4" /> : <span className="size-2 rounded-full bg-current" />}
            </span>
            <div className="min-w-0 pt-1">
              <p className="text-sm font-medium">{item.title}</p>
              {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
              {item.time && <p className="mt-0.5 text-xs text-muted-foreground">{item.time}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
