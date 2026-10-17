import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stepper({ steps, current, className }: { steps: { title: string; description?: string }[]; current: number; className?: string }) {
  return (
    <ol className={cn("flex w-full items-start", className)}>
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s.title} className="relative flex flex-1 flex-col items-center text-center">
            {i > 0 && <span className={cn("absolute right-1/2 top-4 h-0.5 w-full -translate-y-1/2", i <= current ? "bg-primary" : "bg-border")} aria-hidden />}
            <span
              className={cn(
                "relative z-10 flex size-8 items-center justify-center rounded-full border-2 text-xs font-semibold",
                done && "border-primary bg-primary text-primary-foreground",
                active && "border-primary bg-card text-primary",
                !done && !active && "border-border bg-card text-muted-foreground",
              )}
              aria-current={active ? "step" : undefined}
            >
              {done ? <Check className="size-4" strokeWidth={3} /> : i + 1}
            </span>
            <span className={cn("mt-2 text-xs font-medium sm:text-sm", !done && !active && "text-muted-foreground")}>{s.title}</span>
            {s.description && <span className="hidden text-xs text-muted-foreground sm:block">{s.description}</span>}
          </li>
        );
      })}
    </ol>
  );
}
