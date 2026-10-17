import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/site-chrome";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Changelog",
  description: "New features, improvements and fixes in NextAdminPro, the free open-source Next.js admin dashboard template.",
  alternates: { canonical: "/changelog" },
};

const releases = [
  {
    version: "1.2.0",
    date: "October 2026",
    tag: "Latest",
    items: [
      "20 new modules: Deals pipeline, Subscriptions, Transactions, Reviews, Shipments, Vendors, Purchase orders, Warehouses, Expenses, Contracts, Projects, Timesheets, Appointments, Employees, Time off, Payroll, Campaigns, Blog, Knowledge base and Integrations",
      "Reusable CRUD engine with stats, filters, bulk actions and auto-generated forms",
      "Collapsible, filterable sidebar grouped by business area with “New” tags",
      "Bigger, more visible sponsor links across the site and README",
      "New UI components: accordion, alert, stepper, slider, radio cards, toggle group, combobox, tag input, OTP input, rating, dropzone, timeline, breadcrumb, pagination, hover card, context menu, copy button, code block, spinner, kbd, sparkline, avatar group and empty state",
    ],
  },
  {
    version: "1.1.0",
    date: "October 2026",
    items: [
      "New modules: Reports with P&L and scheduling, Coupons, team Chat, File manager, Support helpdesk with SLA tracking",
      "UI Components showcase page",
      "Keyboard shortcuts (?, G + letter, Ctrl/⌘ + B) and a Quick-create menu",
      "Getting-started checklist on the dashboard",
      "Public pages: pricing template, documentation and changelog",
      "Live demo on GitHub Pages via static export",
    ],
  },
  {
    version: "1.0.0",
    date: "October 2026",
    items: [
      "Initial release on Next.js 16, React 19, TypeScript and Tailwind CSS v4",
      "Dashboard, analytics, customers, products, orders, invoices, tasks, calendar and inbox",
      "Roles & permissions, audit log, notifications and settings",
      "Reusable DataTable, command palette, dark mode and accent themes",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <h1 className="text-4xl font-semibold tracking-tight">Changelog</h1>
        <p className="mt-3 text-lg text-muted-foreground">Everything new in NextAdminPro.</p>
        <ol className="mt-12 flex flex-col gap-12 border-l pl-8">
          {releases.map((r) => (
            <li key={r.version} className="relative">
              <span className="absolute -left-[39px] top-1.5 size-3.5 rounded-full border-2 border-background bg-primary" />
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold">v{r.version}</h2>
                {r.tag && <Badge>{r.tag}</Badge>}
                <span className="text-sm text-muted-foreground">{r.date}</span>
              </div>
              <ul className="mt-4 flex list-disc flex-col gap-2 pl-5 text-muted-foreground marker:text-primary">
                {r.items.map((i) => <li key={i}>{i}</li>)}
              </ul>
            </li>
          ))}
        </ol>
      </section>
    </MarketingShell>
  );
}
