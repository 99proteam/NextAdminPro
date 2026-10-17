import type { Metadata } from "next";
import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { MarketingShell } from "@/components/marketing/site-chrome";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing Page Template",
  description: "A ready-made SaaS pricing page template with plan cards and a feature comparison table, included free in the NextAdminPro Next.js admin dashboard.",
  alternates: { canonical: "/pricing" },
};

const plans = [
  { name: "Starter", price: "$0", period: "forever", description: "For individuals and side projects.", cta: "Get started", features: ["1 workspace", "Up to 3 team members", "Core dashboards", "Community support"] },
  { name: "Pro", price: "$29", period: "per month", description: "For growing teams that need more power.", cta: "Start free trial", featured: true, features: ["Unlimited workspaces", "Up to 15 team members", "Advanced analytics & reports", "Audit log", "Priority email support"] },
  { name: "Enterprise", price: "Custom", period: "annual billing", description: "For organisations with advanced needs.", cta: "Contact sales", features: ["Unlimited members", "SSO & SCIM", "Custom roles", "99.9% uptime SLA", "Dedicated success manager"] },
];

const comparison: [string, (boolean | string)[]][] = [
  ["Team members", ["3", "15", "Unlimited"]],
  ["Dashboards & analytics", [true, true, true]],
  ["Scheduled reports", [false, true, true]],
  ["Roles & permissions", ["Basic", "Advanced", "Custom"]],
  ["Audit log retention", [false, "90 days", "Unlimited"]],
  ["API access", [false, true, true]],
  ["SSO / SAML", [false, false, true]],
  ["Support", ["Community", "Email", "Dedicated"]],
];

export default function PricingPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary">Template page</Badge>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Simple, transparent pricing</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            A pricing page you can drop into your SaaS. <span className="font-medium text-foreground">NextAdminPro itself is 100% free.</span>
          </p>
        </div>
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {plans.map((p) => (
            <div key={p.name} className={cn("relative flex flex-col rounded-2xl border bg-card p-7 shadow-xs", p.featured && "border-primary shadow-lg ring-1 ring-primary")}>
              {p.featured && <Badge className="absolute -top-3 left-7 bg-primary text-primary-foreground">Most popular</Badge>}
              <h2 className="text-lg font-semibold">{p.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
              <p className="mt-6"><span className="text-4xl font-semibold tracking-tight">{p.price}</span> <span className="text-sm text-muted-foreground">{p.period}</span></p>
              <ul className="mt-6 flex flex-1 flex-col gap-3 text-sm">
                {p.features.map((f) => <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 size-4 text-success" />{f}</li>)}
              </ul>
              <Button asChild className="mt-8" variant={p.featured ? "default" : "outline"}>
                <Link href="/register">{p.cta}</Link>
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-20 overflow-x-auto rounded-2xl border bg-card">
          <table className="w-full min-w-[560px] text-sm">
            <caption className="sr-only">Plan comparison</caption>
            <thead>
              <tr className="border-b">
                <th className="p-4 text-left font-semibold">Compare plans</th>
                {plans.map((p) => <th key={p.name} className="p-4 text-center font-semibold">{p.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {comparison.map(([feature, values]) => (
                <tr key={feature} className="border-b last:border-0">
                  <td className="p-4 text-muted-foreground">{feature}</td>
                  {values.map((v, i) => (
                    <td key={i} className="p-4 text-center">
                      {v === true ? <Check className="mx-auto size-4 text-success" aria-label="Included" /> : v === false ? <Minus className="mx-auto size-4 text-muted-foreground" aria-label="Not included" /> : v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </MarketingShell>
  );
}
