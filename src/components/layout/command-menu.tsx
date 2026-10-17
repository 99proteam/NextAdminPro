"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Dialog as D } from "radix-ui";
import { ArrowRight, CornerDownLeft, Laptop, Moon, Search, Sun, UserPlus, PackagePlus, FilePlus2, type LucideIcon } from "lucide-react";
import { flatNavigation } from "@/config/navigation";
import { customers, orders, products } from "@/lib/data";
import { cn } from "@/lib/utils";

interface CommandItem {
  id: string;
  group: string;
  label: string;
  hint?: string;
  icon: LucideIcon;
  keywords?: string;
  run: () => void;
}

const CommandContext = React.createContext<{ open: () => void }>({ open: () => {} });
export const useCommandMenu = () => React.useContext(CommandContext);

export function CommandMenuProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const router = useRouter();
  const { setTheme } = useTheme();
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const items = React.useMemo<CommandItem[]>(() => {
    const go = (href: string) => () => router.push(href);
    return [
      ...flatNavigation.map((n) => ({
        id: `nav-${n.href}`,
        group: "Pages",
        label: n.title,
        icon: n.icon,
        keywords: n.keywords?.join(" "),
        run: go(n.href),
      })),
      { id: "act-cust", group: "Actions", label: "Add new customer", icon: UserPlus, run: go("/dashboard/customers?new=1") },
      { id: "act-prod", group: "Actions", label: "Add new product", icon: PackagePlus, run: go("/dashboard/products?new=1") },
      { id: "act-inv", group: "Actions", label: "Create invoice", icon: FilePlus2, run: go("/dashboard/invoices") },
      { id: "theme-light", group: "Theme", label: "Light mode", icon: Sun, run: () => setTheme("light") },
      { id: "theme-dark", group: "Theme", label: "Dark mode", icon: Moon, run: () => setTheme("dark") },
      { id: "theme-system", group: "Theme", label: "System theme", icon: Laptop, run: () => setTheme("system") },
      ...customers.slice(0, 40).map((c) => ({
        id: `cus-${c.id}`,
        group: "Customers",
        label: c.name,
        hint: c.email,
        icon: ArrowRight,
        keywords: `${c.email} ${c.company}`,
        run: go(`/dashboard/customers/${c.id}`),
      })),
      ...orders.slice(0, 40).map((o) => ({
        id: `ord-${o.id}`,
        group: "Orders",
        label: `Order ${o.number}`,
        hint: o.customerName,
        icon: ArrowRight,
        keywords: o.customerName,
        run: go(`/dashboard/orders/${o.id}`),
      })),
      ...products.map((p) => ({
        id: `prd-${p.id}`,
        group: "Products",
        label: p.name,
        hint: p.sku,
        icon: ArrowRight,
        keywords: `${p.sku} ${p.category}`,
        run: go(`/dashboard/products?q=${encodeURIComponent(p.name)}`),
      })),
    ];
  }, [router, setTheme]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.filter((i) => i.group === "Pages" || i.group === "Actions" || i.group === "Theme");
    return items
      .filter((i) => `${i.label} ${i.hint ?? ""} ${i.keywords ?? ""} ${i.group}`.toLowerCase().includes(q))
      .slice(0, 30);
  }, [items, query]);

  const grouped = React.useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    filtered.forEach((i) => map.set(i.group, [...(map.get(i.group) ?? []), i]));
    return [...map.entries()];
  }, [filtered]);

  const run = (item?: CommandItem) => {
    if (!item) return;
    setOpen(false);
    item.run();
  };

  const onOpenChange = (o: boolean) => {
    setOpen(o);
    if (!o) {
      setQuery("");
      setActive(0);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(filtered[active]);
    }
  };

  React.useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const ctx = React.useMemo(() => ({ open: () => setOpen(true) }), []);
  let index = -1;

  return (
    <CommandContext.Provider value={ctx}>
      {children}
      <D.Root open={open} onOpenChange={onOpenChange}>
        <D.Portal>
          <D.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]" />
          <D.Content
            className="fixed left-1/2 top-[12vh] z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border bg-popover shadow-2xl"
            onKeyDown={onKeyDown}
          >
            <D.Title className="sr-only">Command menu</D.Title>
            <D.Description className="sr-only">Search pages, records and actions</D.Description>
            <div className="flex items-center gap-2 border-b px-4">
              <Search className="size-4 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                placeholder="Search pages, customers, orders, products…"
                className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                aria-label="Search"
              />
              <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">ESC</kbd>
            </div>
            <div ref={listRef} className="max-h-[min(60vh,420px)] overflow-y-auto p-2" role="listbox">
              {filtered.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">No results for “{query}”</p>}
              {grouped.map(([group, list]) => (
                <div key={group} className="mb-1">
                  <p className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{group}</p>
                  {list.map((item) => {
                    index += 1;
                    const i = index;
                    return (
                      <button
                        key={item.id}
                        data-index={i}
                        role="option"
                        aria-selected={i === active}
                        onMouseMove={() => setActive(i)}
                        onClick={() => run(item)}
                        className={cn(
                          "flex w-full cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-left text-sm",
                          i === active && "bg-accent",
                        )}
                      >
                        <item.icon className="size-4 shrink-0 text-muted-foreground" />
                        <span className="truncate">{item.label}</span>
                        {item.hint && <span className="ml-auto truncate text-xs text-muted-foreground">{item.hint}</span>}
                        {i === active && !item.hint && <CornerDownLeft className="ml-auto size-3.5 text-muted-foreground" />}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 border-t px-4 py-2 text-[11px] text-muted-foreground">
              <span><kbd className="font-sans">↑↓</kbd> navigate</span>
              <span><kbd className="font-sans">↵</kbd> open</span>
              <span className="ml-auto"><kbd className="font-sans">Ctrl / ⌘ K</kbd> toggle</span>
            </div>
          </D.Content>
        </D.Portal>
      </D.Root>
    </CommandContext.Provider>
  );
}
