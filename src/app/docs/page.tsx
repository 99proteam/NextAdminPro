import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { MarketingShell } from "@/components/marketing/site-chrome";
import { SponsorButton } from "@/components/sponsor-button";

export const metadata: Metadata = {
  title: "Documentation – Install, Customize & Deploy",
  description:
    "How to install, customize, connect data to and deploy NextAdminPro, the free Next.js 16 admin dashboard template built with TypeScript and Tailwind CSS.",
  alternates: { canonical: "/docs" },
};

const sections = [
  { id: "installation", title: "Installation" },
  { id: "structure", title: "Project structure" },
  { id: "theming", title: "Theming & branding" },
  { id: "navigation", title: "Navigation" },
  { id: "data", title: "Connecting your data" },
  { id: "data-table", title: "Using the DataTable" },
  { id: "auth", title: "Authentication" },
  { id: "permissions", title: "Roles & permissions" },
  { id: "deploy", title: "Deployment" },
  { id: "shortcuts", title: "Keyboard shortcuts" },
];

function Code({ children }: { children: string }) {
  return (
    <pre className="my-4 overflow-x-auto rounded-lg border bg-muted/60 p-4 font-mono text-[13px] leading-relaxed">
      <code>{children}</code>
    </pre>
  );
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="mt-14 scroll-mt-24 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0">
      {children}
    </h2>
  );
}

export default function DocsPage() {
  return (
    <MarketingShell>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <nav className="sticky top-24 flex flex-col gap-1 text-sm" aria-label="On this page">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">On this page</p>
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="rounded-md px-2 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
                {s.title}
              </a>
            ))}
            <div className="mt-6 rounded-xl border bg-gradient-to-br from-[#FFDD00]/20 to-transparent p-3">
              <p className="text-xs text-muted-foreground">Find this useful?</p>
              <SponsorButton size="sm" className="mt-2 w-full" />
            </div>
          </nav>
        </aside>

        <article className="min-w-0 max-w-3xl leading-7 [&_code:not(pre_code)]:rounded [&_code:not(pre_code)]:bg-muted [&_code:not(pre_code)]:px-1.5 [&_code:not(pre_code)]:py-0.5 [&_code:not(pre_code)]:text-[13px] [&_p]:mt-4 [&_p]:text-muted-foreground">
          <h1 className="text-4xl font-semibold tracking-tight">Documentation</h1>
          <p className="text-lg">
            Everything you need to install, customize and ship NextAdminPro, the free Next.js admin dashboard template.
          </p>

          <H2 id="installation">Installation</H2>
          <p>You need Node.js 20.9 or newer. Clone the repository, install dependencies and start the dev server:</p>
          <Code>{`git clone ${siteConfig.github}.git my-admin
cd my-admin
npm install
npm run dev`}</Code>
          <p>
            Open <code>http://localhost:3000</code> for the landing page and <code>/dashboard</code> for the admin panel.
          </p>

          <H2 id="structure">Project structure</H2>
          <Code>{`src/
├── app/                 # routes (App Router)
│   ├── (auth)/          # login, register, forgot-password
│   ├── dashboard/       # every admin page
│   └── globals.css      # design tokens
├── components/
│   ├── ui/              # primitives: Button, Card, Dialog, Select…
│   ├── data-table/      # reusable <DataTable>
│   ├── charts/          # Recharts wrappers
│   └── layout/          # sidebar, header, command palette
├── config/              # site + navigation config
└── lib/data/            # typed mock data – swap for your API`}</Code>

          <H2 id="theming">Theming &amp; branding</H2>
          <p>
            Every color is a CSS variable in <code>src/app/globals.css</code>. Change <code>--primary</code> to rebrand the whole
            app, or add your own accent preset:
          </p>
          <Code>{`[data-accent="teal"] { --primary: #0f766e; --ring: #0f766e; }
.dark[data-accent="teal"] { --primary: #2dd4bf; --ring: #2dd4bf; }`}</Code>
          <p>
            Then add <code>&quot;teal&quot;</code> to the <code>accents</code> array in <code>src/components/providers.tsx</code>.
            Update the product name, URL and SEO keywords in <code>src/config/site.ts</code>.
          </p>

          <H2 id="navigation">Navigation</H2>
          <p>
            Sidebar groups and links live in <code>src/config/navigation.ts</code>. The command palette (⌘K) and breadcrumbs pick
            up changes automatically.
          </p>
          <Code>{`{ title: "Leads", href: "/dashboard/leads", icon: Target, keywords: ["crm", "pipeline"] }`}</Code>

          <H2 id="data">Connecting your data</H2>
          <p>
            Pages import from <code>@/lib/data</code>. Server components can fetch from any source (Prisma, Drizzle, Supabase,
            a REST API) and pass the result to the existing client views:
          </p>
          <Code>{`// src/app/dashboard/customers/page.tsx
import { db } from "@/lib/db";

export default async function CustomersPage() {
  const customers = await db.customer.findMany({ orderBy: { createdAt: "desc" } });
  return <CustomersView initial={customers} />;
}`}</Code>
          <p>
            The expected shapes are documented in <code>src/lib/data/types.ts</code>. Replace the local <code>setData</code>
            calls in each view with Server Actions or API calls to persist changes.
          </p>

          <H2 id="data-table">Using the DataTable</H2>
          <p>One component powers every list page: search, faceted filters, sorting, pagination, column toggles, bulk actions and CSV export.</p>
          <Code>{`<DataTable
  data={orders}
  getRowId={(o) => o.id}
  columns={[
    { id: "number", header: "Order", cell: (o) => o.number, sortValue: (o) => o.number },
    { id: "total", header: "Total", cell: (o) => formatCurrency(o.total), sortValue: (o) => o.total },
  ]}
  searchText={(o) => o.customerName}
  filters={[{ id: "status", label: "Status", value: (o) => o.status, options: [...] }]}
  exportName="orders"
  bulkActions={(rows, clear) => <Button onClick={...}>Archive</Button>}
/>`}</Code>

          <H2 id="auth">Authentication</H2>
          <p>
            The login, register and forgot-password pages are UI only, so you can use any provider: Auth.js, Better Auth, Clerk or
            Supabase Auth. Protect <code>/dashboard</code> in a <code>proxy.ts</code> file or by checking the session in{" "}
            <code>src/app/dashboard/layout.tsx</code>.
          </p>

          <H2 id="permissions">Roles &amp; permissions</H2>
          <p>
            <code>src/lib/permissions.ts</code> defines roles, resources, actions and a default matrix, plus a <code>can()</code>{" "}
            helper. Use it to hide UI on the client <strong>and</strong> enforce it on the server:
          </p>
          <Code>{`if (!can(matrix, user.role, "Invoices", "delete")) throw new Error("Forbidden");`}</Code>

          <H2 id="deploy">Deployment</H2>
          <p>
            <strong>Vercel / Node hosting:</strong> <code>npm run build &amp;&amp; npm run start</code>. Set{" "}
            <code>NEXT_PUBLIC_SITE_URL</code> to your domain.
          </p>
          <p>
            <strong>Static hosting (GitHub Pages, Netlify, S3):</strong> <code>npm run build:pages</code> writes a fully static site
            to <code>out/</code>. Set <code>PAGES_BASE_PATH</code> if it’s served from a sub-path (defaults to{" "}
            <code>/NextAdminPro</code>). The included GitHub Action deploys the live demo on every push to <code>main</code>.
          </p>

          <H2 id="shortcuts">Keyboard shortcuts</H2>
          <ul className="mt-4 list-disc pl-5 text-muted-foreground">
            <li><code>Ctrl/⌘ + K</code>: command palette</li>
            <li><code>Ctrl/⌘ + B</code>: toggle sidebar</li>
            <li><code>?</code>: show all shortcuts</li>
            <li><code>G</code> then <code>D</code>/<code>C</code>/<code>O</code>/<code>P</code>/<code>I</code>/<code>S</code>: go to dashboard, customers, orders, products, inbox or settings</li>
          </ul>

          <div className="mt-16 rounded-2xl border bg-card p-6">
            <p className="font-semibold">Need help or have an idea?</p>
            <p>
              Open an issue on{" "}
              <a href={`${siteConfig.github}/issues`} className="font-medium text-primary hover:underline">GitHub</a> or explore the{" "}
              <Link href="/dashboard" className="font-medium text-primary hover:underline">live demo</Link>.
            </p>
          </div>
        </article>
      </div>
    </MarketingShell>
  );
}
