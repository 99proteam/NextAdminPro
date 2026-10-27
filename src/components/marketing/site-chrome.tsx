import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import { siteConfig } from "@/config/site";
import { GithubIcon } from "@/components/icons";
import { Logo } from "@/components/layout/logo";
import { SponsorButton } from "@/components/sponsor-button";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/#features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  { href: "/changelog", label: "Changelog" },
];

export function SponsorBar() {
  return (
    <a
      href={siteConfig.sponsor}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center justify-center gap-2 bg-[#bf3989] px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-[#a52f75] sm:text-base"
    >
      <Heart className="size-5 shrink-0 fill-current transition-transform group-hover:scale-110" />
      <span>Love NextAdminPro? It’s free forever. <span className="underline underline-offset-4">Sponsor it on GitHub</span> and help us reach {siteConfig.sponsorGoal}</span>
      <ArrowRight className="hidden size-4 transition-transform group-hover:translate-x-1 sm:block" />
    </a>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Logo href="/" />
        <nav className="ml-6 hidden items-center gap-1 md:flex" aria-label="Main">
          {links.map((l) => (
            <Button key={l.href} asChild variant="ghost" size="sm">
              <Link href={l.href}>{l.label}</Link>
            </Button>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <SponsorButton size="sm" label="Sponsor" className="hidden sm:inline-flex" />
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
            <a href={siteConfig.github} target="_blank" rel="noreferrer"><GithubIcon /> GitHub</a>
          </Button>
          <Button asChild size="sm">
            <Link href="/dashboard">Live demo</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <Logo href="/" />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">Free, open-source Next.js admin dashboard template for SaaS, e-commerce, CRM and internal tools.</p>
          <SponsorButton size="sm" className="mt-4" />
        </div>
        <FooterCol title="Product" items={[["Live demo", "/dashboard"], ["Features", "/#features"], ["Pricing template", "/pricing"], ["UI components", "/dashboard/components"]]} />
        <FooterCol title="Resources" items={[["Documentation", "/docs"], ["Changelog", "/changelog"], ["GitHub", siteConfig.github], ["Report a bug", `${siteConfig.github}/issues`]]} />
        <FooterCol title="Support" items={[["Sponsor on GitHub", siteConfig.sponsor], ["Buy me a coffee", siteConfig.coffee], ["Star on GitHub", siteConfig.github], ["Contribute", `${siteConfig.github}/blob/main/CONTRIBUTING.md`], ["MIT License", `${siteConfig.github}/blob/main/LICENSE`]]} />
      </div>
      <div className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <p>© 2026 NextAdminPro · Released under the MIT License.</p>
          <p className="flex items-center gap-1">Made with <Heart className="size-3.5 fill-destructive text-destructive" /> by <a href={siteConfig.github} className="font-medium hover:text-foreground">99proteam</a></p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <div>
      <p className="text-sm font-semibold">{title}</p>
      <ul className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
        {items.map(([label, href]) => (
          <li key={label}>
            {href.startsWith("http") ? (
              <a href={href} target="_blank" rel="noreferrer" className="hover:text-foreground">{label}</a>
            ) : (
              <Link href={href} className="hover:text-foreground">{label}</Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <SponsorBar />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
