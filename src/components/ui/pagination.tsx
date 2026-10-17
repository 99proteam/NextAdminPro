"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

/** Page numbers with ellipses, e.g. 1 … 4 5 6 … 20 */
function pageList(page: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, page - 1, page, page + 1].filter((p) => p >= 1 && p <= total));
  const sorted = [...pages].sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? ["…" as const, p] : [p]));
}

export function Pagination({ page, total, onChange, className }: { page: number; total: number; onChange: (p: number) => void; className?: string }) {
  return (
    <nav aria-label="Pagination" className={cn("flex items-center gap-1", className)}>
      <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <ChevronLeft /> Previous
      </Button>
      {pageList(page, total).map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="flex size-8 items-center justify-center text-muted-foreground"><MoreHorizontal className="size-4" /></span>
        ) : (
          <Button key={p} variant={p === page ? "outline" : "ghost"} size="icon-sm" aria-current={p === page ? "page" : undefined} onClick={() => onChange(p)}>
            {p}
          </Button>
        ),
      )}
      <Button variant="ghost" size="sm" disabled={page >= total} onClick={() => onChange(page + 1)}>
        Next <ChevronRight />
      </Button>
    </nav>
  );
}
