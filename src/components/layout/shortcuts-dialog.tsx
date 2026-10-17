"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const shortcuts: [string, string[]][] = [
  ["Open command palette", ["Ctrl / ⌘", "K"]],
  ["Toggle sidebar", ["Ctrl / ⌘", "B"]],
  ["Show keyboard shortcuts", ["?"]],
  ["Go to dashboard", ["G", "D"]],
  ["Go to customers", ["G", "C"]],
  ["Go to orders", ["G", "O"]],
  ["Go to products", ["G", "P"]],
  ["Go to inbox", ["G", "I"]],
  ["Go to settings", ["G", "S"]],
];

const goTo: Record<string, string> = {
  d: "/dashboard",
  c: "/dashboard/customers",
  o: "/dashboard/orders",
  p: "/dashboard/products",
  i: "/dashboard/inbox",
  s: "/dashboard/settings",
  t: "/dashboard/tasks",
  a: "/dashboard/analytics",
};

const isTyping = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName));

/** Global keyboard shortcuts: `?` opens this cheat sheet, `g` + letter navigates, Ctrl/⌘+B toggles the sidebar. */
export function KeyboardShortcuts({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    let pendingG = 0;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        onToggleSidebar();
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
      if (e.key === "?") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key.toLowerCase() === "g") {
        pendingG = Date.now();
      } else if (Date.now() - pendingG < 1000 && goTo[e.key.toLowerCase()]) {
        pendingG = 0;
        router.push(goTo[e.key.toLowerCase()]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, onToggleSidebar]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>Move around NextAdminPro without touching the mouse.</DialogDescription>
        </DialogHeader>
        <ul className="divide-y text-sm">
          {shortcuts.map(([label, keys]) => (
            <li key={label} className="flex items-center justify-between py-2.5">
              <span>{label}</span>
              <span className="flex gap-1">
                {keys.map((k) => (
                  <kbd key={k} className="min-w-6 rounded border bg-muted px-1.5 py-0.5 text-center text-xs font-medium">{k}</kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
