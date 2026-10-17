"use client";

import * as React from "react";
import { ToggleGroup as T } from "radix-ui";
import { cn } from "@/lib/utils";

export function ToggleGroup({ className, ...props }: React.ComponentProps<typeof T.Root>) {
  return <T.Root className={cn("inline-flex items-center rounded-md border bg-card p-0.5 shadow-xs", className)} {...props} />;
}

export function ToggleGroupItem({ className, ...props }: React.ComponentProps<typeof T.Item>) {
  return (
    <T.Item
      className={cn(
        "inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-[5px] px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground [&_svg]:size-4",
        className,
      )}
      {...props}
    />
  );
}
