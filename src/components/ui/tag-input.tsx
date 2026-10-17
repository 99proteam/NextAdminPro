"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function TagInput({ value, onChange, placeholder = "Add a tag…", className }: { value: string[]; onChange: (tags: string[]) => void; placeholder?: string; className?: string }) {
  const [draft, setDraft] = React.useState("");
  const add = () => {
    const t = draft.trim().replace(/,$/, "");
    if (t && !value.includes(t)) onChange([...value, t]);
    setDraft("");
  };
  return (
    <div className={cn("flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-card px-2 py-1.5 shadow-xs focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30", className)}>
      {value.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          {t}
          <button type="button" className="cursor-pointer rounded-sm hover:bg-primary/20" aria-label={`Remove ${t}`} onClick={() => onChange(value.filter((x) => x !== t))}>
            <X className="size-3" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          } else if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1));
        }}
        onBlur={add}
        placeholder={value.length ? "" : placeholder}
        aria-label="Add tag"
        className="min-w-24 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}
