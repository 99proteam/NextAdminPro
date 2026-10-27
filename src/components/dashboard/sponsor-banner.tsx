"use client";

import { Heart, X } from "lucide-react";
import { siteConfig } from "@/config/site";
import { useLocalStorage } from "@/lib/use-local-storage";
import { GithubIcon } from "@/components/icons";
import { SponsorButton } from "@/components/sponsor-button";
import { Button } from "@/components/ui/button";

export function SponsorBanner() {
  const [dismissed, setDismissed] = useLocalStorage("nap-sponsor-banner-dismissed", false);
  if (dismissed) return null;
  return (
    <div className="relative mb-6 flex flex-col gap-4 overflow-hidden rounded-xl border border-[#db61a2]/50 bg-gradient-to-r from-[#db61a2]/20 via-[#db61a2]/5 to-transparent p-4 pr-12 sm:flex-row sm:items-center">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#bf3989] text-white">
        <Heart className="size-5 fill-current" />
      </span>
      <div className="flex-1">
        <p className="font-semibold">Enjoying NextAdminPro? Help keep it free.</p>
        <p className="text-sm text-muted-foreground">
          It’s open source. Become a sponsor on GitHub and help us reach {siteConfig.sponsorGoal} so it can be maintained full time. Prefer a one-off?{" "}
          <a href={siteConfig.coffee} target="_blank" rel="noopener noreferrer" className="font-medium underline underline-offset-4">Buy me a coffee</a>.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <SponsorButton />
        <Button asChild variant="outline">
          <a href={siteConfig.github} target="_blank" rel="noreferrer"><GithubIcon /> Star</a>
        </Button>
      </div>
      <button onClick={() => setDismissed(true)} className="absolute right-3 top-3 cursor-pointer rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Dismiss">
        <X className="size-4" />
      </button>
    </div>
  );
}
