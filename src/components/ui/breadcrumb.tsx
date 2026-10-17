import * as React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export function Breadcrumb({ items, className }: { items: { label: string; href?: string }[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm", className)}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="size-3.5 text-muted-foreground" />}
              {item.href && !last ? (
                <Link href={item.href} className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
                  {i === 0 && <Home className="size-3.5" />}
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className={cn(last ? "font-medium" : "text-muted-foreground")}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
