"use client";

import * as React from "react";
import { Accordion as A } from "radix-ui";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Accordion = A.Root;

export function AccordionItem({ className, ...props }: React.ComponentProps<typeof A.Item>) {
  return <A.Item className={cn("border-b last:border-b-0", className)} {...props} />;
}

export function AccordionTrigger({ className, children, ...props }: React.ComponentProps<typeof A.Trigger>) {
  return (
    <A.Header className="flex">
      <A.Trigger
        className={cn(
          "flex flex-1 cursor-pointer items-center justify-between gap-4 py-4 text-left text-sm font-medium transition-colors hover:text-primary [&[data-state=open]>svg]:rotate-180",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200" />
      </A.Trigger>
    </A.Header>
  );
}

export function AccordionContent({ className, children, ...props }: React.ComponentProps<typeof A.Content>) {
  return (
    <A.Content className="overflow-hidden text-sm text-muted-foreground" {...props}>
      <div className={cn("pb-4", className)}>{children}</div>
    </A.Content>
  );
}
