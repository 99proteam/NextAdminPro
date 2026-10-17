"use client";

import { GithubIcon } from "@/components/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeft, Coffee, Heart } from "lucide-react";
import { navigation } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";
import { SponsorButton } from "@/components/sponsor-button";
import { Logo } from "./logo";

export function isActive(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNav({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-4" aria-label="Main">
      {navigation.map((group) => (
        <div key={group.label} className="flex flex-col gap-0.5">
          {!collapsed && (
            <p className="px-2.5 pb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{group.label}</p>
          )}
          {group.items.map((item) => {
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
      ))}
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
          <Tooltip content="Buy me a coffee" side="right">
            <a
              href={siteConfig.sponsor}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Buy me a coffee"
              className="flex size-9 items-center justify-center rounded-md bg-[#FFDD00] text-[#0d0c22] shadow-sm hover:bg-[#ffe433]"
            >
              <Coffee className="size-4" />
            </a>
          </Tooltip>
        </div>
      ) : (
        <div className="m-3 rounded-xl border bg-gradient-to-br from-[#FFDD00]/20 via-primary/5 to-transparent p-3.5 [@media(max-height:940px)]:border-0 [@media(max-height:940px)]:bg-none [@media(max-height:940px)]:p-0">
          <p className="flex items-center gap-1.5 text-sm font-semibold [@media(max-height:940px)]:hidden">
            <Heart className="size-4 fill-destructive text-destructive" /> Support this project
          </p>
          <p className="mt-1 text-xs text-muted-foreground [@media(max-height:940px)]:hidden">NextAdminPro is free &amp; open source. Your support keeps it growing.</p>
          <SponsorButton size="sm" className="mt-3 w-full [@media(max-height:940px)]:mt-0" />
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
