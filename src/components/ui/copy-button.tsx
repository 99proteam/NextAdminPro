"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export function CopyButton({ value, className, label = "Copy" }: { value: string; className?: string; label?: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <button
      type="button"
      aria-label={copied ? "Copied" : label}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {}
      }}
      className={cn("inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground", className)}
    >
      {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
    </button>
  );
}

export function CodeBlock({ code, className }: { code: string; className?: string }) {
  return (
    <div className={cn("relative rounded-lg border bg-muted/60", className)}>
      <pre className="overflow-x-auto p-4 pr-12 font-mono text-[13px] leading-relaxed"><code>{code}</code></pre>
      <CopyButton value={code} className="absolute right-2 top-2" />
    </div>
  );
}
