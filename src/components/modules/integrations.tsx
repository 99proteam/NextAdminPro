"use client";

import * as React from "react";
import { Check, Plug, Search, Settings2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { integrations as initial, type Integration } from "@/lib/data/modules";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const categories = ["All", "Connected", "Payments", "Communication", "Analytics", "Storage", "Marketing", "Developer", "Accounting"] as const;

export function IntegrationsModule() {
  const [items, setItems] = React.useState(initial);
  const [category, setCategory] = React.useState<(typeof categories)[number]>("All");
  const [query, setQuery] = React.useState("");
  const [configuring, setConfiguring] = React.useState<Integration | null>(null);

  const shown = items.filter(
    (i) =>
      (category === "All" || (category === "Connected" ? i.connected : i.category === category)) &&
      `${i.name} ${i.description} ${i.category}`.toLowerCase().includes(query.toLowerCase()),
  );

  const toggle = (i: Integration) => {
    setItems((l) => l.map((x) => (x.id === i.id ? { ...x, connected: !x.connected } : x)));
    toast.success(i.connected ? `${i.name} disconnected` : `${i.name} connected`);
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Integrations</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect the tools your business already uses. {items.filter((i) => i.connected).length} of {items.length} connected.
          </p>
        </div>
        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search integrations" className="pl-9" aria-label="Search integrations" />
        </div>
      </div>

      <div className="mb-4 flex gap-1 overflow-x-auto">
        {categories.map((c) => (
          <Button key={c} size="sm" variant={category === c ? "secondary" : "ghost"} onClick={() => setCategory(c)}>
            {c}
          </Button>
        ))}
      </div>

      {shown.length === 0 ? (
        <Card className="py-16 text-center text-sm text-muted-foreground">No integrations match your search.</Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {shown.map((i) => (
            <Card key={i.id} className={cn("flex flex-col p-5", i.connected && "border-primary/40")}>
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl text-lg font-bold text-white shadow-sm" style={{ background: i.color }} aria-hidden>
                  {i.name[0]}
                </span>
                <Switch checked={i.connected} onCheckedChange={() => toggle(i)} aria-label={`${i.connected ? "Disconnect" : "Connect"} ${i.name}`} />
              </div>
              <p className="mt-4 flex items-center gap-2 font-semibold">
                {i.name}
                {i.popular && <Badge variant="secondary"><Sparkles />Popular</Badge>}
              </p>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{i.description}</p>
              <div className="mt-4 flex items-center justify-between border-t pt-3">
                <span className="text-xs text-muted-foreground">{i.category}</span>
                {i.connected ? (
                  <Button variant="ghost" size="sm" onClick={() => setConfiguring(i)}><Settings2 /> Configure</Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => toggle(i)}><Plug /> Connect</Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!configuring} onOpenChange={(o) => !o && setConfiguring(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure {configuring?.name}</DialogTitle>
            <DialogDescription>Credentials are stored encrypted. Add them as environment variables in production.</DialogDescription>
          </DialogHeader>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success(`${configuring?.name} settings saved`);
              setConfiguring(null);
            }}
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="api-key">API key</Label>
              <Input id="api-key" type="password" defaultValue="sk_live_••••••••••••••••" />
            </div>
            <label className="flex items-center justify-between rounded-lg border p-3 text-sm">
              Sync automatically every hour <Switch defaultChecked />
            </label>
            <label className="flex items-center justify-between rounded-lg border p-3 text-sm">
              Send error alerts to admins <Switch defaultChecked />
            </label>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setConfiguring(null)}>Cancel</Button>
              <Button type="submit"><Check /> Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
