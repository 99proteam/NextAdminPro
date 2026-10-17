<div align="center">

# NextAdminPro

**The free, open-source Next.js admin dashboard template for any business.**

Analytics · CRM · E-commerce · Invoices · Kanban · Calendar · Inbox · Roles & Permissions · Dark mode

Built with **Next.js 16**, **React 19**, **TypeScript**, **Tailwind CSS v4** and **Radix UI**.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

![NextAdminPro dashboard, light mode](./public/screenshots/dashboard-light.png)

</div>

## Why NextAdminPro?

Most admin templates are either paid, outdated, or a single dashboard page with nothing behind it. NextAdminPro is a **complete, working admin panel**: 15+ pages, reusable components and a typed data layer you can point at your own API or database in an afternoon.

- ✅ **100% free**, MIT licensed. Use it for client projects, SaaS products and internal tools.
- ✅ **Latest stack**: Next.js 16 App Router, React 19, Cache Components, Turbopack.
- ✅ **Production-quality UI**: accessible, responsive and theme-aware (light, dark and six accent colors).
- ✅ **No vendor lock-in**: plain components you own, with no UI kit subscription.

## Features

| Module | What's included |
| --- | --- |
| 📊 **Dashboard** | KPI cards with trends, revenue vs. last year, sales by category, recent orders, top products, activity feed |
| 📈 **Analytics** | Traffic and page views, device split, conversion funnel, revenue vs. expenses, traffic sources, top countries, daily sign-ups |
| 👥 **Customers (CRM)** | Advanced table, add/edit/delete, bulk activate/block, customer profile with lifetime value and order history |
| 📦 **Products & inventory** | Table and grid views, stock status, low-stock alerts, one-click restock, margin column, add/edit dialog |
| 🛒 **Orders** | Status tabs, bulk fulfilment, order detail with fulfilment tracker, status updates, refunds, print |
| 🧾 **Invoices** | Paid/outstanding/overdue summary, line-item invoice builder, send reminders, printable invoice (save as PDF) |
| ✅ **Tasks (Kanban)** | Drag-and-drop board, priorities, tags, assignees, due dates, filters, new-task dialog |
| 📅 **Calendar** | Month view, event categories, day agenda, upcoming events, double-click to create |
| ✉️ **Inbox** | Folders, unread state, star/archive/spam/delete, reading pane, reply, compose |
| 🛡️ **Roles & permissions** | Team management, invite members, change roles, 2FA status, RBAC permission matrix |
| 📜 **Audit log** | Filterable, exportable activity history with severity levels |
| 🔔 **Notifications** | Notification center, filters, mark as read, per-event preferences |
| ⚙️ **Settings** | Profile, workspace, password strength meter, 2FA, active sessions, billing plans and usage, API keys, webhooks, appearance |
| 🔐 **Auth pages** | Login, register and forgot password with validation and OAuth buttons |

### Built into every page

- **⌘K / Ctrl+K command palette**: jump to any page, customer, order or product, or switch theme
- **Reusable `<DataTable>`**: search, faceted filters, sorting, pagination, column visibility, row selection, bulk actions, CSV export and optional grid view
- **Dark mode and accent themes**, driven by CSS design tokens and remembered per user
- **Collapsible sidebar** (state is remembered) and a slide-out navigation on mobile
- **Breadcrumbs, toasts, confirm dialogs, skeleton loaders and a 404 page**
- **SEO-ready**: metadata, Open Graph, `sitemap.xml`, `robots.txt`, web manifest and JSON-LD
- **Accessible**: keyboard navigation, ARIA labels, and status shown with icon + label (never color alone)
- **Print styles** for invoices and orders

## Screenshots

| Dark mode | Analytics |
| --- | --- |
| ![Dashboard in dark mode](./public/screenshots/dashboard-dark.png) | ![Analytics page](./public/screenshots/analytics.png) |
| **Customers (CRM)** | **Kanban tasks** |
| ![Customers table](./public/screenshots/customers.png) | ![Kanban board](./public/screenshots/tasks.png) |
| **Printable invoice** | **Mobile** |
| ![Invoice](./public/screenshots/invoice.png) | <img src="./public/screenshots/mobile.png" alt="Mobile view" width="260" /> |

## Quick start

**Requirements:** Node.js 20.9 or newer.

```bash
git clone https://github.com/99proteam/nextadminpro.git
cd nextadminpro
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The dashboard lives at `/dashboard`.

| Script | Description |
| --- | --- |
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Lint with ESLint |
| `npm run typecheck` | Type-check with TypeScript |

## Project structure

```
src/
├── app/
│   ├── (auth)/              # login, register, forgot-password
│   ├── dashboard/           # every admin page (analytics, customers, orders…)
│   ├── layout.tsx           # root layout, metadata, theme providers
│   ├── page.tsx             # marketing landing page
│   ├── sitemap.ts / robots.ts / manifest.ts
│   └── globals.css          # design tokens (colors, radius, chart palette)
├── components/
│   ├── ui/                  # buttons, cards, dialogs, selects, tables…
│   ├── data-table/          # the reusable advanced <DataTable>
│   ├── charts/              # Recharts wrappers that follow the theme
│   ├── layout/              # sidebar, header, command palette, theme menu
│   └── <feature>/           # page-specific client components
├── config/
│   ├── navigation.ts        # sidebar and command-palette menu
│   └── site.ts              # name, URL and SEO keywords
└── lib/
    ├── data/                # typed mock data, the one place to swap for a real API
    ├── permissions.ts       # RBAC roles, resources and the default matrix
    └── utils.ts             # formatting, CSV export, cn()
```

## Customization

### Branding and colors

All colors are CSS variables in [`src/app/globals.css`](./src/app/globals.css). Change `--primary` to rebrand, or add a new accent preset next to the existing `[data-accent="…"]` blocks. Update the name, URL and SEO keywords in [`src/config/site.ts`](./src/config/site.ts).

### Navigation

Add, remove or reorder sidebar items in [`src/config/navigation.ts`](./src/config/navigation.ts). The command palette picks up the changes automatically.

### Connect your own data

Every page reads from [`src/lib/data`](./src/lib/data). Replace the mock arrays with calls to your API, database (Prisma, Drizzle, Supabase…) or a headless CMS:

```ts
// src/app/dashboard/customers/page.tsx
import { db } from "@/lib/db";

export default async function CustomersPage() {
  const customers = await db.customer.findMany(); // your data source
  return <CustomersView initial={customers} />;
}
```

The types in [`src/lib/data/types.ts`](./src/lib/data/types.ts) describe the shape each page expects.

### Authentication

The auth pages are UI only, so you can plug in any provider: [Auth.js](https://authjs.dev), [Better Auth](https://www.better-auth.com), [Clerk](https://clerk.com) or [Supabase Auth](https://supabase.com/auth). Protect `/dashboard` with a [`proxy.ts`](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) or in the dashboard layout, and enforce the permissions from `src/lib/permissions.ts` on the server.

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2F99proteam%2Fnextadminpro)

Or deploy anywhere that runs Node.js (`npm run build && npm run start`): Netlify, Railway, Render, Fly.io, Docker or your own server. Set `NEXT_PUBLIC_SITE_URL` to your domain (see [`.env.example`](./.env.example)).

## Roadmap

- [ ] Database starter (Prisma + PostgreSQL) with server actions
- [ ] Auth integration example
- [ ] Internationalization (i18n) and RTL
- [ ] More pages: chat, file manager, pricing, FAQ
- [ ] Storybook for UI components

Have an idea? [Open an issue](https://github.com/99proteam/nextadminpro/issues).

## Contributing

Contributions are welcome! Read the [contributing guide](./CONTRIBUTING.md) to get started.

## License

[MIT](./LICENSE) © 99proteam. Free for personal and commercial use.

---

<div align="center">

**If NextAdminPro saves you time, please ⭐ star the repo. It helps other developers find it!**

</div>
