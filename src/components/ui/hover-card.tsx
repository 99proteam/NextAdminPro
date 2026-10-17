"use client";

import * as React from "react";
import { HoverCard as H } from "radix-ui";
import { cn } from "@/lib/utils";

export const HoverCard = H.Root;
export const HoverCardTrigger = H.Trigger;

export function HoverCardContent({ className, sideOffset = 8, ...props }: React.ComponentProps<typeof H.Content>) {
  return (
    <H.Portal>
      <H.Content sideOffset={sideOffset} className={cn("z-50 w-72 rounded-xl border bg-popover p-4 text-popover-foreground shadow-lg", className)} {...props} />
    </H.Portal>
  );
}
