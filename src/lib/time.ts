import { NOW } from "@/lib/data/seed";

/** "3h ago"-style labels relative to the demo dataset's fixed clock. */
export function formatRelative(iso: string, now = NOW) {
  const diff = now - new Date(iso).getTime();
  const abs = Math.abs(diff);
  const m = 60_000, h = 60 * m, d = 24 * h;
  const fmt = (n: number, unit: string) => `${n}${unit} ${diff >= 0 ? "ago" : "from now"}`;
  if (abs < m) return "just now";
  if (abs < h) return fmt(Math.round(abs / m), "m");
  if (abs < d) return fmt(Math.round(abs / h), "h");
  if (abs < 30 * d) return fmt(Math.round(abs / d), "d");
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(iso));
}
