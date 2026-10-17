"use client";

import * as React from "react";
import { Bell, CheckCheck, CreditCard, Server, ShieldAlert, ShoppingBag, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import type { Notification } from "@/lib/data";
import { formatRelative } from "@/lib/time";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const typeIcon = { order: ShoppingBag, user: UserPlus, system: Server, billing: CreditCard, security: ShieldAlert };
const filters = ["all", "unread", "order", "user", "billing", "security", "system"] as const;

export function NotificationsView({ initial }: { initial: Notification[] }) {
  const [items, setItems] = React.useState(initial);
  const [filter, setFilter] = React.useState<(typeof filters)[number]>("all");
  const shown = items.filter((n) => (filter === "all" ? true : filter === "unread" ? !n.read : n.type === filter));

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">{items.filter((n) => !n.read).length} unread notifications</p>
        </div>
        <Button variant="outline" onClick={() => { setItems((l) => l.map((n) => ({ ...n, read: true }))); toast.success("All caught up"); }}>
          <CheckCheck /> Mark all as read
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <Card>
          <div className="flex gap-1 overflow-x-auto border-b p-2">
            {filters.map((f) => (
              <Button key={f} size="sm" variant={filter === f ? "secondary" : "ghost"} className="capitalize" onClick={() => setFilter(f)}>{f}</Button>
            ))}
          </div>
          {shown.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-sm text-muted-foreground"><Bell className="size-8" /> You’re all caught up.</div>
          ) : (
            <ul className="divide-y">
              {shown.map((n) => {
                const Icon = typeIcon[n.type];
                return (
                  <li key={n.id} className={cn("group flex items-start gap-4 px-5 py-4", !n.read && "bg-primary/5")}>
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"><Icon className="size-4" /></span>
                    <button className="min-w-0 flex-1 cursor-pointer text-left" onClick={() => setItems((l) => l.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}>
                      <p className={cn("text-sm", !n.read && "font-semibold")}>{n.title}</p>
                      <p className="text-sm text-muted-foreground">{n.description}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{formatRelative(n.createdAt)}</p>
                    </button>
                    {!n.read && <span className="mt-2 size-2 rounded-full bg-primary" aria-label="Unread" />}
                    <Button variant="ghost" size="icon-sm" aria-label="Dismiss" className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100" onClick={() => setItems((l) => l.filter((x) => x.id !== n.id))}>
                      <Trash2 />
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card className="self-start">
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Choose what you get notified about.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {[
              ["New orders", "Every time a customer places an order", true],
              ["New customers", "When someone signs up", true],
              ["Low stock", "When a product hits its reorder level", true],
              ["Failed payments", "Declined cards and failed invoices", true],
              ["Security alerts", "New sign-ins and permission changes", true],
              ["Weekly digest", "A summary of your KPIs every Monday", false],
            ].map(([title, desc, on]) => (
              <label key={title as string} className="flex items-start justify-between gap-4">
                <span>
                  <span className="block text-sm font-medium">{title}</span>
                  <span className="block text-xs text-muted-foreground">{desc}</span>
                </span>
                <Switch defaultChecked={on as boolean} onCheckedChange={(v) => toast.success(`${title} ${v ? "enabled" : "disabled"}`)} />
              </label>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
