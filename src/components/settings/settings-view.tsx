"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { Check, Copy, CreditCard, Eye, EyeOff, KeyRound, Laptop, Moon, Monitor, Plus, ShieldCheck, Smartphone, Sun, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { currentUser, invoices } from "@/lib/data";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { accents, useAccent } from "@/components/providers";
import { accentSwatch } from "@/components/layout/theme-menu";
import { FormField } from "@/components/form-helpers";
import { StatusBadge } from "@/components/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const tabs = ["profile", "security", "billing", "api-keys", "appearance"] as const;
const tabLabels: Record<(typeof tabs)[number], string> = { profile: "Profile", security: "Security", billing: "Billing", "api-keys": "API keys", appearance: "Appearance" };

export function SettingsView() {
  const params = useSearchParams();
  const router = useRouter();
  const requested = params.get("tab") as (typeof tabs)[number] | null;
  const tab = requested && tabs.includes(requested) ? requested : "profile";

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account, workspace and preferences.</p>
      </div>
      <Tabs value={tab} onValueChange={(v) => router.replace(`/dashboard/settings?tab=${v}`, { scroll: false })}>
        <div className="overflow-x-auto">
          <TabsList>
            {tabs.map((t) => <TabsTrigger key={t} value={t}>{tabLabels[t]}</TabsTrigger>)}
          </TabsList>
        </div>
        <TabsContent value="profile"><ProfileTab /></TabsContent>
        <TabsContent value="security"><SecurityTab /></TabsContent>
        <TabsContent value="billing"><BillingTab /></TabsContent>
        <TabsContent value="api-keys"><ApiKeysTab /></TabsContent>
        <TabsContent value="appearance"><AppearanceTab /></TabsContent>
      </Tabs>
    </>
  );
}

function SaveFooter({ label = "Save changes" }: { label?: string }) {
  return (
    <CardFooter className="justify-end border-t pt-4">
      <Button type="submit">{label}</Button>
    </CardFooter>
  );
}

function ProfileTab() {
  return (
    <div className="grid max-w-3xl gap-4">
      <Card>
        <form onSubmit={(e) => { e.preventDefault(); toast.success("Profile updated"); }}>
          <CardHeader>
            <CardTitle>Personal information</CardTitle>
            <CardDescription>This is how others will see you in the workspace.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <Avatar name={currentUser.name} className="size-16 text-lg" />
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => toast.info("Hook this up to your file storage (S3, UploadThing, Vercel Blob…)")}><Upload /> Upload photo</Button>
                <Button type="button" variant="ghost" size="sm">Remove</Button>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Full name" name="name" defaultValue={currentUser.name} />
              <FormField label="Email" name="email" type="email" defaultValue={currentUser.email} />
              <FormField label="Job title" name="title" defaultValue="Founder & CEO" />
              <div className="flex flex-col gap-1.5">
                <Label>Timezone</Label>
                <Select name="tz" defaultValue="America/Los_Angeles">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["America/Los_Angeles", "America/New_York", "Europe/London", "Europe/Berlin", "Asia/Kolkata", "Asia/Tokyo", "Australia/Sydney"].map((t) => <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" name="bio" defaultValue="Building tools that help small businesses run smoothly." />
            </div>
          </CardContent>
          <SaveFooter />
        </form>
      </Card>
      <Card>
        <form onSubmit={(e) => { e.preventDefault(); toast.success("Workspace updated"); }}>
          <CardHeader>
            <CardTitle>Workspace</CardTitle>
            <CardDescription>Business details used on invoices and emails.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField label="Business name" name="business" defaultValue="NextAdminPro Inc." />
            <FormField label="Support email" name="support" type="email" defaultValue="support@nextadminpro.dev" />
            <div className="flex flex-col gap-1.5">
              <Label>Currency</Label>
              <Select name="currency" defaultValue="USD">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["USD", "EUR", "GBP", "INR", "JPY", "AUD", "CAD"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <FormField label="Tax ID" name="tax" defaultValue="US-84-1234567" />
          </CardContent>
          <SaveFooter />
        </form>
      </Card>
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
          <CardDescription>Permanently delete this workspace and all of its data.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="destructive" onClick={() => toast.error("Disabled in the demo")}><Trash2 /> Delete workspace</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function passwordScore(p: string) {
  let s = 0;
  if (p.length >= 8) s++;
  if (p.length >= 12) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}

function SecurityTab() {
  const [pw, setPw] = React.useState("");
  const [twoFactor, setTwoFactor] = React.useState(true);
  const [sessions, setSessions] = React.useState([
    { id: 1, device: "MacBook Pro · Chrome", location: "San Francisco, US", current: true, icon: Laptop, last: "Active now" },
    { id: 2, device: "iPhone 17 · Safari", location: "San Francisco, US", current: false, icon: Smartphone, last: "2 hours ago" },
    { id: 3, device: "Windows · Edge", location: "Berlin, DE", current: false, icon: Monitor, last: "3 days ago" },
  ]);
  const score = passwordScore(pw);
  const labels = ["Too weak", "Weak", "Fair", "Good", "Strong", "Very strong"];

  return (
    <div className="grid max-w-3xl gap-4">
      <Card>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (score < 3) return toast.error("Choose a stronger password");
            toast.success("Password updated");
            setPw("");
            e.currentTarget.reset();
          }}
        >
          <CardHeader>
            <CardTitle>Change password</CardTitle>
            <CardDescription>Use at least 12 characters with a mix of letters, numbers and symbols.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><FormField label="Current password" name="current" type="password" autoComplete="current-password" /></div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new">New password</Label>
              <Input id="new" name="new" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} />
              {pw && (
                <div className="flex items-center gap-2">
                  <Progress value={(score / 5) * 100} className="h-1.5" indicatorClassName={cn(score < 3 ? "bg-destructive" : score < 4 ? "bg-warning" : "bg-success")} />
                  <span className="shrink-0 text-xs text-muted-foreground">{labels[score]}</span>
                </div>
              )}
            </div>
            <FormField label="Confirm new password" name="confirm" type="password" autoComplete="new-password" />
          </CardContent>
          <SaveFooter label="Update password" />
        </form>
      </Card>
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <CardTitle className="flex items-center gap-2">Two-factor authentication {twoFactor && <Badge variant="success"><ShieldCheck /> Enabled</Badge>}</CardTitle>
            <CardDescription>Require a code from your authenticator app when signing in.</CardDescription>
          </div>
          <Switch checked={twoFactor} onCheckedChange={(v) => { setTwoFactor(v); toast.success(v ? "2FA enabled" : "2FA disabled"); }} aria-label="Two-factor authentication" />
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <CardTitle>Active sessions</CardTitle>
            <CardDescription>Devices currently signed in to your account.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => { setSessions((s) => s.filter((x) => x.current)); toast.success("Signed out of other sessions"); }}>Sign out others</Button>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {sessions.map((s) => (
              <li key={s.id} className="flex items-center gap-3 py-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-muted"><s.icon className="size-4 text-muted-foreground" /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{s.device} {s.current && <Badge variant="success" className="ml-1">This device</Badge>}</p>
                  <p className="text-xs text-muted-foreground">{s.location} · {s.last}</p>
                </div>
                {!s.current && <Button variant="ghost" size="sm" onClick={() => setSessions((l) => l.filter((x) => x.id !== s.id))}>Revoke</Button>}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

const plans = [
  { name: "Starter", price: 0, features: ["1 workspace", "3 team members", "Community support"] },
  { name: "Pro", price: 29, features: ["Unlimited workspaces", "15 team members", "Audit log", "Priority email support"] },
  { name: "Enterprise", price: 99, features: ["Unlimited members", "SSO & SCIM", "Custom roles", "Dedicated success manager"] },
];

function BillingTab() {
  const [plan, setPlan] = React.useState("Pro");
  const [yearly, setYearly] = React.useState(false);
  return (
    <div className="grid max-w-5xl gap-4">
      <Card>
        <CardHeader className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle>Plan</CardTitle>
            <CardDescription>You’re on the <span className="font-medium text-foreground">{plan}</span> plan. Next renewal on Nov 15, 2026.</CardDescription>
          </div>
          <label className="flex items-center gap-2 text-sm">
            Monthly <Switch checked={yearly} onCheckedChange={setYearly} aria-label="Yearly billing" /> Yearly <Badge variant="success">Save 20%</Badge>
          </label>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {plans.map((p) => {
            const current = p.name === plan;
            const price = yearly ? Math.round(p.price * 0.8) : p.price;
            return (
              <div key={p.name} className={cn("flex flex-col rounded-xl border p-5", current && "border-primary ring-1 ring-primary")}>
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{p.name}</p>
                  {current && <Badge>Current</Badge>}
                </div>
                <p className="mt-3"><span className="text-3xl font-semibold tracking-tight">${price}</span><span className="text-sm text-muted-foreground">/mo</span></p>
                <ul className="mt-4 flex flex-1 flex-col gap-2 text-sm">
                  {p.features.map((f) => <li key={f} className="flex items-center gap-2"><Check className="size-4 text-success" /> {f}</li>)}
                </ul>
                <Button className="mt-5" variant={current ? "outline" : "default"} disabled={current} onClick={() => { setPlan(p.name); toast.success(`Switched to ${p.name}`); }}>
                  {current ? "Current plan" : `Switch to ${p.name}`}
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Usage this month</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {[["Team members", 7, 15], ["API requests", 742_000, 1_000_000], ["Storage (GB)", 18, 50]].map(([l, used, max]) => (
              <div key={l as string} className="text-sm">
                <div className="mb-1.5 flex justify-between"><span>{l}</span><span className="tabular text-muted-foreground">{(used as number).toLocaleString()} / {(max as number).toLocaleString()}</span></div>
                <Progress value={((used as number) / (max as number)) * 100} />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Payment method</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <span className="flex h-10 w-14 items-center justify-center rounded-md border bg-muted"><CreditCard className="size-5" /></span>
            <div className="flex-1 text-sm">
              <p className="font-medium">Visa ending in 4242</p>
              <p className="text-muted-foreground">Expires 08/2028</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => toast.info("Connect Stripe, Paddle or Lemon Squeezy to manage payment methods")}>Update</Button>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Billing history</CardTitle></CardHeader>
        <CardContent className="px-0">
          <ul className="divide-y">
            {invoices.slice(0, 5).map((inv, i) => (
              <li key={inv.id} className="flex items-center gap-4 px-5 py-3 text-sm">
                <span className="font-medium">{formatDate(new Date(Date.UTC(2026, 9 - i, 15)).toISOString(), { month: "long", year: "numeric" })}</span>
                <span className="text-muted-foreground">Pro plan</span>
                <span className="ml-auto tabular">{formatCurrency(29)}</span>
                <StatusBadge status="paid" />
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
  scope: "read" | "write" | "admin";
}

function randomKey() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return "nap_live_" + Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function ApiKeysTab() {
  const [keys, setKeys] = React.useState<ApiKey[]>([
    { id: "k1", name: "Production server", key: "nap_live_8f2c1a9b7e4d3f6a0b1c2d3e4f5a6b7c8d9e0f1a2b3c", created: "2026-03-02T10:00:00Z", lastUsed: "2 minutes ago", scope: "write" },
    { id: "k2", name: "Analytics export", key: "nap_live_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d", created: "2026-07-19T10:00:00Z", lastUsed: "Yesterday", scope: "read" },
  ]);
  const [revealed, setRevealed] = React.useState<string | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [justCreated, setJustCreated] = React.useState<ApiKey | null>(null);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Couldn’t access the clipboard");
    }
  };
  const mask = (k: string) => `${k.slice(0, 13)}${"•".repeat(16)}${k.slice(-4)}`;

  return (
    <div className="grid max-w-4xl gap-4">
      <Card>
        <CardHeader className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle>API keys</CardTitle>
            <CardDescription>Keys give programmatic access to your workspace. Keep them secret.</CardDescription>
          </div>
          <Button onClick={() => setCreateOpen(true)}><Plus /> Create key</Button>
        </CardHeader>
        <CardContent className="px-0">
          {keys.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">No API keys yet.</p>
          ) : (
            <ul className="divide-y">
              {keys.map((k) => (
                <li key={k.id} className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted"><KeyRound className="size-4 text-muted-foreground" /></span>
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-sm font-medium">{k.name} <Badge variant="outline" className="capitalize">{k.scope}</Badge></p>
                      <p className="truncate font-mono text-xs text-muted-foreground">{revealed === k.id ? k.key : mask(k.key)}</p>
                      <p className="text-xs text-muted-foreground">Created {formatDate(k.created)} · Last used {k.lastUsed}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 self-end md:self-auto">
                    <Button variant="ghost" size="icon-sm" aria-label={revealed === k.id ? "Hide key" : "Reveal key"} onClick={() => setRevealed(revealed === k.id ? null : k.id)}>{revealed === k.id ? <EyeOff /> : <Eye />}</Button>
                    <Button variant="ghost" size="icon-sm" aria-label="Copy key" onClick={() => copy(k.key)}><Copy /></Button>
                    <Button variant="ghost" size="icon-sm" aria-label="Revoke key" className="text-destructive" onClick={() => { setKeys((l) => l.filter((x) => x.id !== k.id)); toast.success(`Revoked “${k.name}”`); }}><Trash2 /></Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Webhooks</CardTitle>
          <CardDescription>Get notified at your endpoint when events happen. Manage endpoints, signing secrets and delivery logs on the Webhooks page.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" asChild><Link href="/dashboard/webhooks">Manage webhooks</Link></Button>
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={(o) => { setCreateOpen(o); if (!o) setJustCreated(null); }}>
        <DialogContent>
          {justCreated ? (
            <>
              <DialogHeader>
                <DialogTitle>Save your API key</DialogTitle>
                <DialogDescription>This is the only time the full key is shown. Store it somewhere safe.</DialogDescription>
              </DialogHeader>
              <div className="flex gap-2">
                <Input readOnly value={justCreated.key} className="font-mono text-xs" aria-label="New API key" />
                <Button variant="outline" size="icon" onClick={() => copy(justCreated.key)} aria-label="Copy key"><Copy /></Button>
              </div>
              <DialogFooter><Button onClick={() => { setCreateOpen(false); setJustCreated(null); }}>Done</Button></DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Create API key</DialogTitle>
                <DialogDescription>Give the key a name and choose its access level.</DialogDescription>
              </DialogHeader>
              <form
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
                  if (!f.name.trim()) return toast.error("Name is required");
                  const k: ApiKey = { id: `k${Date.now()}`, name: f.name, key: randomKey(), created: new Date().toISOString(), lastUsed: "Never", scope: f.scope as ApiKey["scope"] };
                  setKeys((l) => [k, ...l]);
                  setJustCreated(k);
                }}
              >
                <FormField label="Name" name="name" placeholder="e.g. Mobile app" autoFocus />
                <div className="flex flex-col gap-1.5">
                  <Label>Scope</Label>
                  <Select name="scope" defaultValue="read">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="read">Read only</SelectItem>
                      <SelectItem value="write">Read &amp; write</SelectItem>
                      <SelectItem value="admin">Full admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                  <Button type="submit">Create key</Button>
                </DialogFooter>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AppearanceTab() {
  const { theme, setTheme } = useTheme();
  const { accent, setAccent } = useAccent();
  const [density, setDensity] = React.useState("comfortable");
  const modes = [
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
    { id: "system", label: "System", icon: Laptop },
  ];
  return (
    <div className="grid max-w-3xl gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>Pick a color mode for the dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-3">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => setTheme(m.id)}
              className={cn("flex cursor-pointer flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium hover:bg-muted/50", theme === m.id && "border-primary ring-1 ring-primary")}
              aria-pressed={theme === m.id}
            >
              <m.icon className="size-5" /> {m.label}
            </button>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Accent color</CardTitle>
          <CardDescription>Used for buttons, links, active states and highlights.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {accents.map((a) => (
            <button
              key={a}
              onClick={() => setAccent(a)}
              className={cn("flex cursor-pointer items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3 text-sm capitalize hover:bg-muted/50", accent === a && "border-foreground")}
              aria-pressed={accent === a}
            >
              <span className="flex size-6 items-center justify-center rounded-full text-white" style={{ background: accentSwatch[a] }}>
                {accent === a && <Check className="size-3.5" />}
              </span>
              {a}
            </button>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Interface</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Table density</p>
              <p className="text-xs text-muted-foreground">Control how much information fits on screen.</p>
            </div>
            <Select value={density} onValueChange={setDensity}>
              <SelectTrigger className="w-40" aria-label="Density"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="comfortable">Comfortable</SelectItem>
                <SelectItem value="spacious">Spacious</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-center justify-between gap-4">
            <span>
              <span className="block text-sm font-medium">Reduce motion</span>
              <span className="block text-xs text-muted-foreground">Minimise animations and transitions.</span>
            </span>
            <Switch />
          </label>
        </CardContent>
      </Card>
    </div>
  );
}
