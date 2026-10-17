"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select…",
  className,
}: {
  options: { value: string; label: string }[];
  value: string | null;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const listId = React.useId();
  const [query, setQuery] = React.useState("");
  const filtered = options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()));
  const selected = options.find((o) => o.value === value);
  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setQuery(""); }}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          className={cn("flex h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-input bg-card px-3 text-sm shadow-xs", !selected && "text-muted-foreground", className)}
        >
          <span className="truncate">{selected?.label ?? placeholder}</span>
          <ChevronsUpDown className="size-4 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0">
        <div className="flex items-center gap-2 border-b px-3">
          <Search className="size-4 text-muted-foreground" />
          <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" aria-label="Search options" className="h-9 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
        </div>
        <ul id={listId} className="max-h-60 overflow-y-auto p-1" role="listbox">
          {filtered.length === 0 && <li className="px-2 py-6 text-center text-sm text-muted-foreground">No results.</li>}
          {filtered.map((o) => (
            <li key={o.value}>
              <button
                type="button"
                role="option"
                aria-selected={o.value === value}
                onClick={() => { onChange(o.value); setOpen(false); setQuery(""); }}
                className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
              >
                <Check className={cn("size-4", o.value === value ? "opacity-100" : "opacity-0")} />
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
