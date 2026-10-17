import { Logo } from "@/components/layout/logo";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col px-4 py-8 sm:px-10">
        <Logo href="/" />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">{children}</div>
        <p className="text-center text-xs text-muted-foreground">© 2026 NextAdminPro · MIT License</p>
      </div>
      <div className="relative hidden overflow-hidden border-l bg-card lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_70%_20%,color-mix(in_oklab,var(--primary)_22%,transparent),transparent)]" />
        <div className="relative flex h-full flex-col justify-end p-12">
          <blockquote className="max-w-md">
            <p className="text-2xl font-medium leading-snug tracking-tight">
              “We replaced three internal tools with one NextAdminPro dashboard and shipped our ops panel in a weekend.”
            </p>
            <footer className="mt-4 text-sm text-muted-foreground">Example testimonial · Replace with your own</footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
