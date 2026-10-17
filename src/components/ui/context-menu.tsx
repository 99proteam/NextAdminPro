"use client";

import * as React from "react";
import { ContextMenu as C } from "radix-ui";
import { cn } from "@/lib/utils";

export const ContextMenu = C.Root;
export const ContextMenuTrigger = C.Trigger;

export function ContextMenuContent({ className, ...props }: React.ComponentProps<typeof C.Content>) {
  return (
    <C.Portal>
      <C.Content className={cn("z-50 min-w-48 rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg", className)} {...props} />
    </C.Portal>
  );
}

export function ContextMenuItem({ className, destructive, ...props }: React.ComponentProps<typeof C.Item> & { destructive?: boolean }) {
  return (
    <C.Item
      className={cn(
        "flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-accent [&_svg]:size-4 [&_svg]:text-muted-foreground",
        destructive && "text-destructive [&_svg]:text-destructive",
        className,
      )}
      {...props}
    />
  );
}

export function ContextMenuSeparator() {
  return <C.Separator className="-mx-1 my-1 h-px bg-border" />;
}

export function ContextMenuShortcut({ children }: { children: React.ReactNode }) {
  return <span className="ml-auto text-xs tracking-widest text-muted-foreground">{children}</span>;
}
