"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Rating({ value, onChange, max = 5, size = "md" }: { value: number; onChange?: (v: number) => void; max?: number; size?: "sm" | "md" | "lg" }) {
  const [hover, setHover] = React.useState<number | null>(null);
  const shown = hover ?? value;
  const cls = size === "sm" ? "size-4" : size === "lg" ? "size-7" : "size-5";
  return (
    <div className="inline-flex items-center gap-0.5" role={onChange ? "radiogroup" : "img"} aria-label={`${value} out of ${max} stars`} onMouseLeave={() => setHover(null)}>
      {Array.from({ length: max }, (_, i) => {
        const n = i + 1;
        const star = <Star className={cn(cls, n <= shown ? "fill-chart-4 text-chart-4" : "text-muted-foreground/40")} />;
        return onChange ? (
          <button key={n} type="button" role="radio" aria-checked={n === value} aria-label={`${n} star${n > 1 ? "s" : ""}`} className="cursor-pointer transition-transform hover:scale-110" onMouseEnter={() => setHover(n)} onClick={() => onChange(n)}>
            {star}
          </button>
        ) : (
          <span key={n}>{star}</span>
        );
      })}
    </div>
  );
}
