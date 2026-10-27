import { Heart } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/** Highlighted GitHub Sponsors link in GitHub's sponsor pink. */
export function SponsorButton({
  className,
  size = "default",
  label = "Sponsor on GitHub",
}: {
  className?: string;
  size?: "sm" | "default" | "lg";
  label?: string;
}) {
  return (
    <a
      href={siteConfig.sponsor}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-[#bf3989] font-semibold text-white shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_4px_14px_-4px_rgba(219,97,162,0.7)] transition hover:-translate-y-px hover:bg-[#a52f75] hover:shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_6px_20px_-4px_rgba(219,97,162,0.9)]",
        size === "sm" && "h-8 px-3 text-xs [&_svg]:size-3.5",
        size === "default" && "h-9 px-4 text-sm [&_svg]:size-4",
        size === "lg" && "h-11 px-6 text-base [&_svg]:size-5",
        className,
      )}
    >
      <Heart className="fill-current transition-transform group-hover:scale-110" />
      {label}
    </a>
  );
}
