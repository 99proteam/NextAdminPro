"use client";

import { GithubIcon } from "@/components/icons";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "login" | "register" | "forgot";

const copy: Record<Mode, { title: string; subtitle: string; cta: string }> = {
  login: { title: "Welcome back", subtitle: "Sign in to your admin account", cta: "Sign in" },
  register: { title: "Create an account", subtitle: "Start managing your business in minutes", cta: "Create account" },
  forgot: { title: "Forgot password?", subtitle: "We’ll email you a link to reset it", cta: "Send reset link" },
};

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.5 5.5 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.7z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.8 3.6-4.9 6.7-4.9z" />
    </svg>
  );
}

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const c = copy[mode];

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const next: Record<string, string> = {};
    if (mode === "register" && !data.name?.trim()) next.name = "Please enter your name";
    if (!/^\S+@\S+\.\S+$/.test(data.email ?? "")) next.email = "Enter a valid email address";
    if (mode !== "forgot" && (data.password ?? "").length < 8) next.password = "Password must be at least 8 characters";
    setErrors(next);
    if (Object.keys(next).length) return;

    // Demo only: replace with your auth provider (Auth.js, Clerk, Supabase, Better Auth…)
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (mode === "forgot") {
        toast.success("Reset link sent", { description: `Check ${data.email} for instructions.` });
        return;
      }
      toast.success(mode === "login" ? "Signed in" : "Account created");
      router.push("/dashboard");
    }, 700);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{c.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{c.subtitle}</p>
      </div>

      {mode !== "forgot" && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" type="button" onClick={() => toast.info("Connect an OAuth provider to enable Google sign-in")}>
              <GoogleIcon /> Google
            </Button>
            <Button variant="outline" type="button" onClick={() => toast.info("Connect an OAuth provider to enable GitHub sign-in")}>
              <GithubIcon /> GitHub
            </Button>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or continue with email <span className="h-px flex-1 bg-border" />
          </div>
        </>
      )}

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        {mode === "register" && (
          <Field label="Full name" name="name" error={errors.name}>
            <Input id="name" name="name" autoComplete="name" placeholder="Alex Morgan" aria-invalid={!!errors.name} />
          </Field>
        )}
        <Field label="Email" name="email" error={errors.email}>
          <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@company.com" defaultValue={mode === "login" ? "alex@nextadminpro.dev" : undefined} aria-invalid={!!errors.email} />
        </Field>
        {mode !== "forgot" && (
          <Field
            label="Password"
            name="password"
            error={errors.password}
            extra={
              mode === "login" && (
                <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                  Forgot password?
                </Link>
              )
            }
          >
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                placeholder="••••••••"
                defaultValue={mode === "login" ? "demo-password" : undefined}
                className="pr-10"
                aria-invalid={!!errors.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-0 top-0 flex h-9 w-10 cursor-pointer items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </Field>
        )}
        {mode === "login" && (
          <label className="flex items-center gap-2 text-sm">
            <Checkbox name="remember" defaultChecked /> Remember me for 30 days
          </label>
        )}
        {mode === "register" && (
          <label className="flex items-start gap-2 text-sm text-muted-foreground">
            <Checkbox name="terms" defaultChecked className="mt-0.5" /> I agree to the Terms of Service and Privacy Policy
          </label>
        )}
        <Button type="submit" disabled={loading} className="w-full">
          {loading && <Loader2 className="animate-spin" />} {c.cta}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {mode === "login" ? (
          <>Don’t have an account? <Link href="/register" className="font-medium text-primary hover:underline">Sign up</Link></>
        ) : mode === "register" ? (
          <>Already have an account? <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link></>
        ) : (
          <>Remembered it? <Link href="/login" className="font-medium text-primary hover:underline">Back to sign in</Link></>
        )}
      </p>
    </div>
  );
}

function Field({
  label,
  name,
  error,
  extra,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={name}>{label}</Label>
        {extra}
      </div>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
