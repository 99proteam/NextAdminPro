"use client";

import * as React from "react";
import { RadioGroup as R } from "radix-ui";
import { cn } from "@/lib/utils";

export function RadioGroup({ className, ...props }: React.ComponentProps<typeof R.Root>) {
  return <R.Root className={cn("grid gap-2.5", className)} {...props} />;
}

export function RadioGroupItem({ className, ...props }: React.ComponentProps<typeof R.Item>) {
  return (
    <R.Item
      className={cn(
        "flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full border border-input bg-card shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary",
        className,
      )}
      {...props}
    >
      <R.Indicator className="size-2 rounded-full bg-primary" />
    </R.Item>
  );
}

/** Large selectable card variant, e.g. for plan or shipping-method pickers. */
export function RadioCard({
  value,
  title,
  description,
  extra,
}: {
  value: string;
  title: string;
  description?: string;
  extra?: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/40 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
      <RadioGroupItem value={value} className="mt-0.5" />
      <span className="flex-1">
        <span className="block text-sm font-medium">{title}</span>
        {description && <span className="block text-xs text-muted-foreground">{description}</span>}
      </span>
      {extra}
    </label>
  );
}
