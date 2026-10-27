import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  FolderKanban,
  Handshake,
  Megaphone,
  Plug,
  UsersRound,
  Briefcase,
  Building2,
  Command,
  FileBarChart,
  FileText,
  FolderOpen,
  Headphones,
  Heart,
  KanbanSquare,
  Keyboard,
  LifeBuoy,
  MessagesSquare,
  Moon,
  Package,
  Rocket,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Star,
  Table2,
  TicketPercent,
  Users,
  Target,
  Webhook,
  Zap,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { GithubIcon } from "@/components/icons";
import { MarketingShell } from "@/components/marketing/site-chrome";
import { SponsorButton } from "@/components/sponsor-button";
import { Button } from "@/components/ui/button";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const features = [
  { icon: BarChart3, title: "Analytics dashboards", text: "KPI cards, revenue, traffic, funnels and device breakdowns with accessible, theme-aware charts." },
  { icon: FileBarChart, title: "Reports & P&L", text: "Profit & loss, monthly performance, one-click exports and scheduled email reports." },
  { icon: Table2, title: "Advanced data tables", text: "Search, faceted filters, sorting, pagination, column visibility, bulk actions and CSV export." },
  { icon: Users, title: "CRM & customers", text: "Customer list and profiles with lifetime value, order history and status management." },
  { icon: Package, title: "Products & inventory", text: "Table and grid views, low-stock alerts, restocking and margins." },
  { icon: ShoppingCart, title: "Orders", text: "Status workflow, bulk fulfilment, order detail with tracking, refunds and printing." },
  { icon: FileText, title: "Invoices", text: "Line-item invoice builder, paid/overdue tracking and print-ready invoices." },
  { icon: TicketPercent, title: "Coupons & promotions", text: "Percentage, fixed and free-shipping codes with usage limits and schedules." },
  { icon: LifeBuoy, title: "Support helpdesk", text: "Multi-channel tickets, SLA timers, assignment, quick replies and conversation view." },
  { icon: MessagesSquare, title: "Team chat", text: "Channels, direct messages, emoji reactions and typing indicators." },
  { icon: FolderOpen, title: "File manager", text: "Folders, drag-and-drop upload, grid/list views, sharing, starring and storage usage." },
  { icon: KanbanSquare, title: "Kanban, calendar & inbox", text: "Drag-and-drop task board, month calendar with events and an email-style inbox." },
  { icon: ShieldCheck, title: "Roles, permissions & audit log", text: "RBAC permission matrix, team invites, 2FA status and a filterable activity log." },
  { icon: Handshake, title: "Deals pipeline & subscriptions", text: "Drag-and-drop sales pipeline, weighted forecast, MRR/ARR, churn and transactions." },
  { icon: UsersRound, title: "HR, time off & payroll", text: "Employee directory, leave approvals and monthly pay runs with payslip export." },
  { icon: Boxes, title: "Inventory & procurement", text: "Warehouses, stock movements, vendors, purchase orders, shipments and contracts." },
  { icon: FolderKanban, title: "Projects & timesheets", text: "Budgets, progress, live time tracking, billable hours and appointments." },
  { icon: Megaphone, title: "Marketing & CMS", text: "Campaigns with open/click tracking, blog posts, knowledge base and reviews." },
  { icon: Plug, title: "Integrations marketplace", text: "Connect Stripe, Slack, HubSpot, Zapier, S3 and more with a single toggle." },
  { icon: Target, title: "Goals & OKRs", text: "Objectives with measurable key results, team progress, health status and quick check-ins." },
  { icon: Webhook, title: "Webhooks", text: "Signed event endpoints, test events, delivery logs with retries and secret rotation." },
  { icon: Command, title: "Command palette", text: "Press ⌘K / Ctrl+K to jump to any page, customer, order or product." },
  { icon: Keyboard, title: "Keyboard shortcuts", text: "G + letter navigation, Ctrl/⌘+B to toggle the sidebar, ? for the cheat sheet." },
  { icon: Moon, title: "Dark mode & accent themes", text: "Light, dark and system modes plus six accent colors, driven by CSS design tokens." },
  { icon: Smartphone, title: "Fully responsive", text: "Collapsible sidebar on desktop, slide-out navigation and touch-friendly layouts on mobile." },
  { icon: Zap, title: "Next.js 16 + React 19", text: "App Router, Server Components, Cache Components, Turbopack and strict TypeScript." },
];

const useCases = [
  { icon: Rocket, title: "SaaS products", text: "Billing, team roles, API keys, usage and analytics." },
  { icon: ShoppingCart, title: "E-commerce stores", text: "Products, inventory, orders, coupons and invoices." },
  { icon: Briefcase, title: "Agencies & freelancers", text: "Clients, invoices, tasks, files and calendar." },
  { icon: Headphones, title: "Customer support teams", text: "Helpdesk tickets, SLAs, inbox and team chat." },
  { icon: Building2, title: "Internal tools", text: "Data tables, reports, audit logs and permissions." },
  { icon: Users, title: "CRM & sales", text: "Customer profiles, lifetime value and activity." },
];

const stack = ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS v4", "Radix UI", "Recharts", "Lucide icons", "next-themes", "Sonner"];

const faqs = [
  {
    q: "Is NextAdminPro really free?",
    a: "Yes. NextAdminPro is 100% free and open source under the MIT license. You can use it for personal projects, client work and commercial SaaS products without paying anything.",
  },
  {
    q: "Which version of Next.js does it use?",
    a: "NextAdminPro is built on Next.js 16 with the App Router, React 19, TypeScript, Tailwind CSS v4 and Radix UI primitives.",
  },
  {
    q: "Can I connect it to my own database or API?",
    a: "Yes. All pages read from a typed data layer in src/lib/data. Replace the mock data with Prisma, Drizzle, Supabase, Firebase or any REST/GraphQL API.",
  },
  {
    q: "Does it include authentication?",
    a: "It ships with polished login, register and forgot-password pages. Plug in Auth.js, Better Auth, Clerk or Supabase Auth to make them work.",
  },
  {
    q: "Is it compatible with shadcn/ui?",
    a: "Yes. The components follow the same patterns as shadcn/ui (Radix UI + Tailwind CSS + class-variance-authority), so you can add shadcn components alongside them.",
  },
  {
    q: "How can I support the project?",
    a: "Star the repository on GitHub, share it with other developers, contribute on GitHub, or sponsor the maintainer on GitHub Sponsors at github.com/sponsors/99proteam (goal: $5,000/month). One-off coffees at buymeacoffee.com/99proteam are welcome too.",
  },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    description: siteConfig.description,
    url: siteConfig.url,
    image: `${siteConfig.url}${siteConfig.ogImage}`,
    screenshot: `${siteConfig.url}/screenshots/dashboard-light.png`,
    softwareVersion: siteConfig.version,
    author: { "@type": "Organization", name: "99proteam", url: "https://github.com/99proteam" },
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    license: "https://opensource.org/licenses/MIT",
    keywords: siteConfig.keywords.join(", "),
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: siteConfig.name,
    description: siteConfig.description,
    codeRepository: siteConfig.github,
    programmingLanguage: ["TypeScript", "React", "Next.js"],
    runtimePlatform: "Node.js",
    license: "https://opensource.org/licenses/MIT",
    author: { "@type": "Organization", name: "99proteam", url: "https://github.com/99proteam" },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  },
];

export default function LandingPage() {
  return (
    <MarketingShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,color-mix(in_oklab,var(--primary)_16%,transparent),transparent)]" />
        <div className="mx-auto max-w-4xl px-4 pb-12 pt-20 text-center sm:px-6 sm:pt-24">
          <a
            href={siteConfig.github}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-xs hover:text-foreground"
          >
            <span className="size-1.5 rounded-full bg-success" /> v1.2 · Free &amp; open source · MIT license
          </a>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            The free <span className="text-primary">Next.js admin dashboard</span> template for any business
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground text-pretty">
            50+ ready-made pages: analytics, CRM &amp; deals, goals &amp; OKRs, webhooks, e-commerce, subscriptions, invoices, HR &amp; payroll, projects,
            inventory, helpdesk, chat, marketing, CMS, roles &amp; permissions and more. Built on Next.js 16, TypeScript and Tailwind CSS.
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
            <SponsorButton size="lg" />
          </div>
          <div className="mx-auto mt-8 max-w-lg overflow-x-auto rounded-lg border bg-card px-4 py-3 text-left font-mono text-sm whitespace-nowrap shadow-xs">
            <span className="select-none text-muted-foreground">$ </span>
            git clone {siteConfig.github}.git
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="overflow-hidden rounded-t-xl border border-b-0 bg-card shadow-2xl">
            <Image
              src={`${basePath}/screenshots/dashboard-light.png`}
              alt="NextAdminPro admin dashboard with KPI cards, revenue chart and recent orders"
              width={1440}
              height={900}
              priority
              className="block w-full dark:hidden"
            />
            <Image
              src={`${basePath}/screenshots/dashboard-dark.png`}
              alt="NextAdminPro admin dashboard in dark mode"
              width={1440}
              height={900}
              className="hidden w-full dark:block"
            />
          </div>
        </div>
      </section>

      <section className="border-b bg-card">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 text-center sm:px-6 md:grid-cols-4">
          {[
            ["50+", "Pages & modules"],
            ["40+", "UI components"],
            ["100%", "Free (MIT)"],
            ["2 + 6", "Themes & accents"],
          ].map(([v, l]) => (
            <div key={l} className="flex flex-col-reverse">
              <dt className="mt-1 text-sm text-muted-foreground">{l}</dt>
              <dd className="text-3xl font-semibold tracking-tight">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Everything a business admin panel needs</h2>
          <p className="mt-3 text-muted-foreground">Pages and components you’d otherwise build from scratch, ready to connect to your own API or database.</p>
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
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight">One template, any kind of business</h2>
            <p className="mt-3 text-muted-foreground">Start from the modules you need and remove the rest.</p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {useCases.map((u) => (
              <div key={u.title} className="flex gap-4 rounded-xl border bg-background p-5">
                <u.icon className="size-6 shrink-0 text-primary" />
                <div>
                  <h3 className="font-semibold">{u.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{u.text}</p>
                </div>
              </div>
            ))}
          </div>
          <h2 className="mt-16 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">Built with a modern stack</h2>
          <ul className="mt-6 flex flex-wrap justify-center gap-2">
            {stack.map((s) => (
              <li key={s} className="rounded-full border bg-background px-4 py-1.5 text-sm font-medium">
                {s}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="sponsor" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border-2 border-[#db61a2] bg-gradient-to-br from-[#db61a2]/25 via-[#db61a2]/10 to-transparent p-8 sm:p-12">
          <Heart className="absolute -right-6 -top-6 size-48 rotate-12 fill-current text-[#db61a2]/25" aria-hidden />
          <div className="relative max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-[#bf3989] px-3 py-1 text-xs font-semibold text-white">
              <Heart className="size-3.5 fill-current" /> Support open source
            </p>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">Love NextAdminPro? Become a sponsor 💖</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              NextAdminPro is free and always will be. If it saved you weeks of work, sponsor it on GitHub. Our goal is{" "}
              <b className="text-foreground">{siteConfig.sponsorGoal}</b> so new pages, bug fixes and updates can ship full time.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <SponsorButton size="lg" />
              <Button asChild size="lg" variant="outline" className="bg-card">
                <a href={siteConfig.github} target="_blank" rel="noreferrer">
                  <Star /> Star on GitHub
                </a>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              <a href={siteConfig.sponsor} target="_blank" rel="noopener noreferrer" className="font-medium underline-offset-4 hover:underline">
                github.com/sponsors/99proteam
              </a>
              {" · or "}
              <a href={siteConfig.coffee} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
                buy me a coffee
              </a>
            </p>
          </div>
        </div>
      </section>

      <section className="border-t bg-card">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <h2 className="text-center text-3xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="mt-10 divide-y rounded-xl border bg-background">
            {faqs.map((f) => (
              <details key={f.q} className="group p-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                  {f.q}
                  <span className="text-xl leading-none text-muted-foreground transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <h2 className="text-3xl font-semibold tracking-tight">Start building your admin panel today</h2>
        <p className="mt-3 text-muted-foreground">
          Clone the repo, run <code className="rounded bg-muted px-1.5 py-0.5 text-sm">npm run dev</code> and you have a full
          dashboard in under a minute.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/dashboard">
              Explore the live demo <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/docs">Read the docs</Link>
          </Button>
        </div>
      </section>
    </MarketingShell>
  );
}
