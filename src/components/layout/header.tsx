"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog as D } from "radix-ui";
import { Bell, ChevronRight, CreditCard, LogOut, Menu, Search, Settings, User } from "lucide-react";
import { flatNavigation } from "@/config/navigation";
import { currentUser, notifications } from "@/lib/data";
import { formatRelative } from "@/lib/time";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SheetContent } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCommandMenu } from "./command-menu";
import { Logo } from "./logo";
import { SidebarNav } from "./sidebar";
import { ThemeMenu } from "./theme-menu";

function Breadcrumbs() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);
  const crumbs = parts.map((part, i) => {
    const href = "/" + parts.slice(0, i + 1).join("/");
    const nav = flatNavigation.find((n) => n.href === href);
    const isRecord = /^(cus|ord|inv|prd)_/.test(part);
    return { href, label: nav?.title ?? (isRecord ? "Details" : part.replace(/-/g, " ")) };
  });
  return (
    <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1.5 text-sm md:flex">
      {crumbs.map((c, i) => (
        <React.Fragment key={c.href}>
          {i > 0 && <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />}
          {i === crumbs.length - 1 ? (
            <span className="truncate font-medium capitalize">{c.label}</span>
          ) : (
            <Link href={c.href} className="truncate capitalize text-muted-foreground hover:text-foreground">
              {c.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

function NotificationsPopover() {
  const [items, setItems] = React.useState(notifications);
  const unread = items.filter((n) => !n.read).length;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Notifications (${unread} unread)`} className="relative">
          <Bell />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
              {unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(380px,calc(100vw-2rem))] p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          <button
            className="cursor-pointer text-xs font-medium text-primary hover:underline disabled:opacity-50"
            disabled={unread === 0}
            onClick={() => setItems((list) => list.map((n) => ({ ...n, read: true })))}
          >
            Mark all as read
          </button>
        </div>
        <ul className="max-h-96 overflow-y-auto">
          {items.slice(0, 6).map((n) => (
            <li key={n.id} className={cn("flex gap-3 border-b px-4 py-3 last:border-0", !n.read && "bg-primary/5")}>
              <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-primary")} />
              <div className="min-w-0">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="truncate text-xs text-muted-foreground">{n.description}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{formatRelative(n.createdAt)}</p>
              </div>
            </li>
          ))}
        </ul>
        <Link href="/dashboard/notifications" className="block border-t py-2.5 text-center text-xs font-medium text-primary hover:underline">
          View all notifications
        </Link>
      </PopoverContent>
    </Popover>
  );
}

function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex cursor-pointer items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Avatar name={currentUser.name} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60">
        <DropdownMenuLabel className="flex flex-col gap-0.5 font-normal">
          <span className="text-sm font-medium text-foreground">{currentUser.name}</span>
          <span className="text-xs">{currentUser.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild><Link href="/dashboard/settings"><User /> Profile</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/dashboard/settings?tab=billing"><CreditCard /> Billing</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/dashboard/settings?tab=security"><Settings /> Settings</Link></DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild destructive><Link href="/login"><LogOut /> Log out</Link></DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Header() {
  const { open } = useCommandMenu();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  return (
    <header className="no-print sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur-md sm:px-6">
      <D.Root open={mobileOpen} onOpenChange={setMobileOpen}>
        <D.Trigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
            <Menu />
          </Button>
        </D.Trigger>
        <SheetContent side="left" className="max-w-72">
          <D.Title className="sr-only">Navigation</D.Title>
          <D.Description className="sr-only">Main navigation</D.Description>
          <div className="flex h-16 items-center border-b px-4">
            <Logo />
          </div>
          <SidebarNav onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </D.Root>

      <Breadcrumbs />

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <button
          onClick={open}
          className="flex h-9 cursor-pointer items-center gap-2 rounded-md border bg-card px-3 text-sm text-muted-foreground shadow-xs hover:bg-accent sm:w-64"
        >
          <Search className="size-4" />
          <span className="hidden sm:inline">Search…</span>
          <kbd className="ml-auto hidden rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium sm:inline">⌘K</kbd>
        </button>
        <ThemeMenu />
        <NotificationsPopover />
        <UserMenu />
      </div>
    </header>
  );
}
