"use client";

import { GithubIcon } from "@/components/icons";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronsLeft, Heart, Search } from "lucide-react";
import { navigation } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/lib/use-local-storage";
import { Tooltip } from "@/components/ui/tooltip";
import { SponsorButton } from "@/components/sponsor-button";
import { Logo } from "./logo";

export function isActive(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

const DEFAULT_OPEN = ["Overview"];

export function SidebarNav({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useLocalStorage<string[]>("nap-nav-open", DEFAULT_OPEN);
  const [filter, setFilter] = React.useState("");
  const q = filter.trim().toLowerCase();
  const activeGroup = navigation.find((g) => g.items.some((i) => isActive(pathname, i.href)))?.label;

  const groups = navigation
    .map((g) => ({
      ...g,
      items: q ? g.items.filter((i) => `${i.title} ${i.keywords?.join(" ") ?? ""}`.toLowerCase().includes(q)) : g.items,
    }))
    .filter((g) => g.items.length > 0);

  const toggle = (label: string) =>
    setOpenGroups((o) => (o.includes(label) ? o.filter((x) => x !== label) : [...o, label]));

  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-3" aria-label="Main">
      {!collapsed && (
        <div className="relative mb-2">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter menu…"
            aria-label="Filter menu"
            className="h-8 w-full rounded-md border bg-background pl-8 pr-2 text-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring"
          />
        </div>
      )}
      {groups.map((group) => {
        const open = collapsed || !!q || group.label === activeGroup || openGroups.includes(group.label);
        return (
          <div key={group.label} className="flex flex-col gap-0.5">
            {!collapsed && (
              <button
                onClick={() => toggle(group.label)}
                aria-expanded={open}
                className="flex cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground"
              >
                {group.label}
                <ChevronDown className={cn("size-3.5 transition-transform", !open && "-rotate-90")} />
              </button>
            )}
            {collapsed && <div className="mx-auto my-1 h-px w-6 bg-border first:hidden" />}
            {open &&
              group.items.map((item) => {
                const active = isActive(pathname, item.href);
                const link = (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group flex h-9 items-center gap-3 rounded-md px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                      active && "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary",
                      collapsed && "justify-center px-0",
                    )}
                  >
                    <item.icon className="size-[18px] shrink-0" />
                    {!collapsed && <span className="truncate">{item.title}</span>}
                    {!collapsed && item.badge && (
                      <span className="ml-auto rounded-full bg-primary px-1.5 py-px text-[10px] font-semibold text-primary-foreground tabular">
                        {item.badge}
                      </span>
                    )}
                    {!collapsed && !item.badge && item.isNew && (
                      <span className="ml-auto rounded-full bg-success/10 px-1.5 py-px text-[10px] font-semibold text-success">New</span>
                    )}
                  </Link>
                );
                return collapsed ? (
                  <Tooltip key={item.href} content={item.title} side="right">
                    {link}
                  </Tooltip>
                ) : (
                  link
                );
              })}
          </div>
        );
      })}
      {groups.length === 0 && <p className="px-2.5 py-4 text-xs text-muted-foreground">No pages match “{filter}”.</p>}
    </nav>
  );
}

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <aside
      className={cn(
        "no-print sticky top-0 hidden h-svh shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 lg:flex",
        collapsed ? "w-[68px]" : "w-64",
      )}
    >
      <div className={cn("flex h-16 items-center border-b border-sidebar-border px-4", collapsed && "justify-center px-0")}>
        <Logo collapsed={collapsed} />
      </div>
      <SidebarNav collapsed={collapsed} />
      {collapsed ? (
        <div className="flex justify-center py-3">
          <Tooltip content="Sponsor on GitHub" side="right">
            <a
              href={siteConfig.sponsor}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Sponsor on GitHub"
              className="flex size-9 items-center justify-center rounded-md bg-[#bf3989] text-white shadow-sm hover:bg-[#a52f75]"
            >
              <Heart className="size-4 fill-current" />
            </a>
          </Tooltip>
        </div>
      ) : (
        <div className="m-3 rounded-xl border bg-gradient-to-br from-[#db61a2]/15 via-primary/5 to-transparent p-3.5 [@media(max-height:940px)]:border-0 [@media(max-height:940px)]:bg-none [@media(max-height:940px)]:p-0">
          <p className="flex items-center gap-1.5 text-sm font-semibold [@media(max-height:940px)]:hidden">
            <Heart className="size-4 fill-destructive text-destructive" /> Support this project
          </p>
          <p className="mt-1 text-xs text-muted-foreground [@media(max-height:940px)]:hidden">NextAdminPro is free &amp; open source. Help us reach {siteConfig.sponsorGoal} on GitHub Sponsors.</p>
          <SponsorButton className="mt-3 h-10 w-full text-sm [@media(max-height:940px)]:mt-0" />
          <a
            href={siteConfig.github}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex h-8 w-full items-center justify-center gap-2 rounded-md border bg-card text-xs font-medium hover:bg-accent [@media(max-height:940px)]:hidden"
          >
            <GithubIcon className="size-3.5" /> Star on GitHub
          </a>
        </div>
      )}
      <button
        onClick={onToggle}
        className="flex h-11 cursor-pointer items-center justify-center gap-2 border-t border-sidebar-border text-xs text-muted-foreground hover:text-foreground"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <ChevronsLeft className={cn("size-4 transition-transform", collapsed && "rotate-180")} />
        {!collapsed && "Collapse"}
      </button>
    </aside>
  );
}
