"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/** One-time code input: auto-advances, supports paste and backspace navigation. */
export function OtpInput({ length = 6, onComplete, className }: { length?: number; onComplete?: (code: string) => void; className?: string }) {
  const [digits, setDigits] = React.useState<string[]>(() => Array(length).fill(""));
  const refs = React.useRef<(HTMLInputElement | null)[]>([]);

  const update = (next: string[]) => {
    setDigits(next);
    if (next.every(Boolean)) onComplete?.(next.join(""));
  };

  return (
    <div className={cn("flex gap-2", className)} role="group" aria-label="One-time code">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={d}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          aria-label={`Digit ${i + 1}`}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(-1);
            const next = [...digits];
            next[i] = v;
            update(next);
            if (v && i < length - 1) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
          }}
          onPaste={(e) => {
            const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
            if (!pasted) return;
            e.preventDefault();
            const next = Array.from({ length }, (_, k) => pasted[k] ?? "");
            update(next);
            refs.current[Math.min(pasted.length, length - 1)]?.focus();
          }}
          className="size-11 rounded-md border border-input bg-card text-center text-lg font-semibold shadow-xs tabular focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        />
      ))}
    </div>
  );
}
