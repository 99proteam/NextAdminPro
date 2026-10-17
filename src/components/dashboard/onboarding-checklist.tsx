"use client";

import Link from "next/link";
import { Check, ChevronRight, Rocket } from "lucide-react";
import { useLocalStorage } from "@/lib/use-local-storage";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const steps = [
  { id: "profile", label: "Complete your business profile", href: "/dashboard/settings" },
  { id: "product", label: "Add your first product", href: "/dashboard/products?new=1" },
  { id: "team", label: "Invite a teammate", href: "/dashboard/roles" },
  { id: "theme", label: "Pick your brand color", href: "/dashboard/settings?tab=appearance" },
  { id: "api", label: "Create an API key", href: "/dashboard/settings?tab=api-keys" },
];

const EMPTY: string[] = [];

export function OnboardingChecklist() {
  const [done, setDone] = useLocalStorage<string[]>("nap-onboarding", EMPTY);
  const pct = Math.round((done.length / steps.length) * 100);
  if (done.length === steps.length) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Rocket className="size-4 text-primary" /> Get started</CardTitle>
        <CardDescription>{done.length} of {steps.length} steps complete</CardDescription>
        <Progress value={pct} className="mt-2" />
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-1">
          {steps.map((s) => {
            const complete = done.includes(s.id);
            return (
              <li key={s.id} className="flex items-center gap-3">
                <button
                  onClick={() => setDone((d) => (d.includes(s.id) ? d.filter((x) => x !== s.id) : [...d, s.id]))}
                  className={cn("flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full border-2", complete ? "border-primary bg-primary text-primary-foreground" : "border-input")}
                  aria-label={complete ? `Mark “${s.label}” incomplete` : `Mark “${s.label}” complete`}
                >
                  {complete && <Check className="size-3" strokeWidth={3} />}
                </button>
                <Link href={s.href} className={cn("flex flex-1 items-center justify-between rounded-md py-1.5 text-sm hover:text-primary", complete && "text-muted-foreground line-through")}>
                  {s.label}
                  <ChevronRight className="size-4 text-muted-foreground" />
                </Link>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
