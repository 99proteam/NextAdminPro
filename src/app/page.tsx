import { GithubIcon } from "@/components/icons";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Command,
  FileText,
  Heart,
  KanbanSquare,
  Moon,
  Package,
  ShieldCheck,
  Smartphone,
  Table2,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { siteConfig } from "@/config/site";

const features = [
  { icon: BarChart3, title: "Analytics dashboards", text: "KPI cards, revenue, traffic, funnels and device breakdowns with accessible, theme-aware charts." },
  { icon: Table2, title: "Advanced data tables", text: "Search, faceted filters, sorting, pagination, column visibility, bulk actions and CSV export." },
  { icon: Users, title: "CRM & customers", text: "Customer list and profile pages with lifetime value, order history and status management." },
  { icon: Package, title: "E-commerce", text: "Products and inventory with low-stock alerts, orders with status workflow and order details." },
  { icon: FileText, title: "Invoices", text: "Invoice list with paid/overdue tracking and a print-ready invoice view (save as PDF)." },
  { icon: KanbanSquare, title: "Kanban, calendar & inbox", text: "Drag-and-drop task board, month calendar with events and a full email-style inbox." },
  { icon: ShieldCheck, title: "Roles, permissions & audit log", text: "RBAC permission matrix, team management, 2FA status and a filterable activity log." },
  { icon: Command, title: "Command palette", text: "Press ⌘K / Ctrl+K to jump to any page, customer, order or product, or switch theme." },
  { icon: Moon, title: "Dark mode & accent themes", text: "Light, dark and system modes plus six accent colors, all driven by CSS design tokens." },
  { icon: Smartphone, title: "Fully responsive", text: "Collapsible sidebar on desktop, slide-out navigation on mobile, tables that scroll gracefully." },
  { icon: Zap, title: "Next.js 16 + React 19", text: "App Router, Server Components, Cache Components, Turbopack and TypeScript strict mode." },
  { icon: Heart, title: "Free & MIT licensed", text: "Use it for client work, SaaS products or internal tools. No sign-up, no paywall." },
];

const stack = ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS v4", "Radix UI", "Recharts", "Lucide icons", "next-themes"];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: siteConfig.name,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  description: siteConfig.description,
  url: siteConfig.url,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  license: "https://opensource.org/licenses/MIT",
  codeRepository: siteConfig.github,
};

export default function LandingPage() {
  return (
    <div className="min-h-svh">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Logo href="/" />
          <nav className="ml-auto flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <a href="#features">Features</a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href={siteConfig.github} target="_blank" rel="noreferrer">
                <GithubIcon /> GitHub
              </a>
            </Button>
            <Button asChild size="sm">
              <Link href="/dashboard">Live demo</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,color-mix(in_oklab,var(--primary)_16%,transparent),transparent)]" />
          <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-28">
            <a
              href={siteConfig.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-xs hover:text-foreground"
            >
              <span className="size-1.5 rounded-full bg-success" /> Free &amp; open source · MIT license
            </a>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
              The free <span className="text-primary">Next.js admin dashboard</span> template for any business
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground text-pretty">
              NextAdminPro gives you a production-ready admin panel with analytics, CRM, e-commerce, invoices, kanban,
              calendar, inbox, roles &amp; permissions and dark mode, built on Next.js 16, TypeScript and Tailwind CSS.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/dashboard">
                  Open live demo <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href={siteConfig.github} target="_blank" rel="noreferrer">
                  <GithubIcon /> Star on GitHub
                </a>
              </Button>
            </div>
            <div className="mx-auto mt-8 max-w-md rounded-lg border bg-card px-4 py-3 text-left font-mono text-sm shadow-xs">
              <span className="select-none text-muted-foreground">$ </span>
              git clone {siteConfig.github}.git
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight">Everything a business admin panel needs</h2>
            <p className="mt-3 text-muted-foreground">
              Pages and components you would otherwise build from scratch, ready to connect to your own API or database.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border bg-card p-5 shadow-xs">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="size-[18px]" />
                </div>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y bg-card">
          <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Built with a modern stack</h2>
            <ul className="mt-6 flex flex-wrap justify-center gap-2">
              {stack.map((s) => (
                <li key={s} className="rounded-full border bg-background px-4 py-1.5 text-sm font-medium">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <h2 className="text-3xl font-semibold tracking-tight">Start building your admin panel today</h2>
          <p className="mt-3 text-muted-foreground">Clone the repo, run <code className="rounded bg-muted px-1.5 py-0.5 text-sm">npm run dev</code> and you have a full dashboard in under a minute.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/dashboard">Explore the dashboard <ArrowRight /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">View auth pages</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <p>© 2026 NextAdminPro · Released under the MIT License.</p>
          <a href={siteConfig.github} target="_blank" rel="noreferrer" className="hover:text-foreground">
            github.com/99proteam/nextadminpro
          </a>
        </div>
      </footer>
    </div>
  );
}
