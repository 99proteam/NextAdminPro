import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-7", className)} aria-hidden>
      <rect width="32" height="32" rx="8" className="fill-primary" />
      <path d="M9 22V10l7 8 7-8v12" fill="none" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ collapsed, href = "/dashboard" }: { collapsed?: boolean; href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 font-semibold tracking-tight">
      <LogoMark />
      {!collapsed && (
        <span className="text-[15px]">
          NextAdmin<span className="text-primary">Pro</span>
        </span>
      )}
    </Link>
  );
}
