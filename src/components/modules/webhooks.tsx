"use client";

import * as React from "react";
import { Dialog as D } from "radix-ui";
import { Activity, CheckCircle2, Eye, EyeOff, KeyRound, Plus, RefreshCw, RotateCcw, Send, Trash2, Webhook, XCircle } from "lucide-react";
import { toast } from "sonner";
import { webhookEndpoints, webhookEvents, type WebhookDelivery, type WebhookEndpoint, type WebhookEvent } from "@/lib/data/modules";
import { NOW } from "@/lib/data/seed";
import { formatRelative } from "@/lib/time";
import { cn, formatDate } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/stat-card";
import { ConfirmDialog } from "@/components/form-helpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CodeBlock, CopyButton } from "@/components/ui/copy-button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, SheetContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/misc";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ok = (d: WebhookDelivery) => d.statusCode >= 200 && d.statusCode < 300;

function successRate(deliveries: WebhookDelivery[]) {
  return deliveries.length ? Math.round((deliveries.filter(ok).length / deliveries.length) * 100) : 100;
}

function newSecret() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return "whsec_" + Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Sample payload sent for test events, shaped like a real event envelope. */
function samplePayload(event: WebhookEvent, id: string) {
  const [object] = event.split(".");
  return JSON.stringify({ id, type: event, created: Math.floor(NOW / 1000), data: { object: { id: `${object.slice(0, 3)}_test_123`, object, livemode: false } } }, null, 2);
}

const verifySnippet = `import crypto from "node:crypto";

// Every request carries a "Webhook-Signature: t=<unix>,v1=<hex>" header.
export function verifyWebhook(rawBody, header, secret) {
  const { t, v1 } = Object.fromEntries(header.split(",").map((p) => p.split("=")));
  const expected = crypto.createHmac("sha256", secret).update(\`\${t}.\${rawBody}\`).digest("hex");
  const fresh = Math.abs(Date.now() / 1000 - Number(t)) < 300; // reject replays older than 5 minutes
  return fresh && crypto.timingSafeEqual(Buffer.from(v1), Buffer.from(expected));
}`;

export function WebhooksModule() {
  const [endpoints, setEndpoints] = React.useState(webhookEndpoints);
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [deleting, setDeleting] = React.useState<WebhookEndpoint | null>(null);
  const active = endpoints.find((e) => e.id === openId) ?? null;

  const patch = (id: string, p: Partial<WebhookEndpoint>, message?: string) => {
    setEndpoints((list) => list.map((e) => (e.id === id ? { ...e, ...p } : e)));
    if (message) toast.success(message);
  };

  /** Simulates a delivery: enabled endpoints mostly answer 2xx, the rest fail. */
  const deliver = (ep: WebhookEndpoint, event: WebhookEvent, attempt = 1) => {
    const success = ep.url.startsWith("https://") && Math.random() > 0.15;
    const d: WebhookDelivery = {
      id: `evt_${Date.now().toString(36)}`,
      event,
      statusCode: success ? 200 : 503,
      durationMs: success ? 80 + Math.round(Math.random() * 300) : 5000,
      at: new Date(NOW).toISOString(),
      attempt,
    };
    patch(ep.id, { deliveries: [d, ...ep.deliveries] });
    if (success) toast.success(`${event} delivered · ${d.statusCode}`);
    else toast.error(`${event} failed · ${d.statusCode}. It will be retried automatically.`);
  };

  const all = endpoints.flatMap((e) => e.deliveries);

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Webhooks</h1>
          <p className="mt-1 text-sm text-muted-foreground">Send real-time events to your own endpoints. Every request is signed so you can verify it came from us.</p>
        </div>
        <Button onClick={() => setCreating(true)}><Plus /> Add endpoint</Button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active endpoints" value={`${endpoints.filter((e) => e.enabled).length} / ${endpoints.length}`} icon={Webhook} />
        <StatCard label="Deliveries" value={String(all.length)} icon={Activity} />
        <StatCard label="Success rate" value={`${successRate(all)}%`} icon={CheckCircle2} />
        <StatCard label="Failed deliveries" value={String(all.filter((d) => !ok(d)).length)} icon={XCircle} />
      </div>

      {endpoints.length === 0 ? (
        <Card>
          <EmptyState icon={Webhook} title="No endpoints yet" description="Add an endpoint to start receiving events." action={<Button onClick={() => setCreating(true)}><Plus /> Add endpoint</Button>} />
        </Card>
      ) : (
        <Card className="divide-y p-0">
          {endpoints.map((ep) => {
            const rate = successRate(ep.deliveries);
            const last = ep.deliveries[0];
            return (
              <div key={ep.id} className="flex flex-col gap-3 p-5 lg:flex-row lg:items-center">
                <button type="button" className="min-w-0 flex-1 cursor-pointer text-left" onClick={() => setOpenId(ep.id)}>
                  <p className="truncate font-mono text-sm font-medium">{ep.url}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{ep.description || "No description"}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {ep.events.map((ev) => <Badge key={ev} variant="outline" className="font-mono text-[11px]">{ev}</Badge>)}
                  </div>
                </button>
                <div className="flex items-center gap-6 text-xs">
                  <div>
                    <p className="text-muted-foreground">Success</p>
                    <p className={cn("font-medium tabular", rate < 80 ? "text-destructive" : rate < 95 ? "text-warning" : "text-success")}>{rate}%</p>
                  </div>
                  <div className="w-24">
                    <p className="text-muted-foreground">Last event</p>
                    <p className="font-medium">{last ? formatRelative(last.at) : "Never"}</p>
                  </div>
                  <label className="flex items-center gap-2">
                    <Switch checked={ep.enabled} onCheckedChange={(v) => patch(ep.id, { enabled: v }, v ? "Endpoint enabled" : "Endpoint paused")} aria-label={`Enable ${ep.url}`} />
                    <span className="w-14">{ep.enabled ? "Enabled" : "Paused"}</span>
                  </label>
                  <Button variant="outline" size="sm" onClick={() => setOpenId(ep.id)}>Details</Button>
                </div>
              </div>
            );
          })}
        </Card>
      )}

      <Card className="mt-6 p-5">
        <h2 className="flex items-center gap-2 font-medium"><KeyRound className="size-4" /> Verify signatures</h2>
        <p className="mt-1 mb-4 text-sm text-muted-foreground">
          Compute an HMAC-SHA256 of <code className="font-mono">timestamp.body</code> with the endpoint&apos;s signing secret and compare it with the header in constant time.
        </p>
        <CodeBlock code={verifySnippet} />
      </Card>

      <D.Root open={!!active} onOpenChange={(o) => !o && setOpenId(null)}>
        {active && (
          <EndpointDrawer
            ep={active}
            onPatch={(p, m) => patch(active.id, p, m)}
            onTest={(event) => deliver(active, event)}
            onRetry={(d) => deliver(active, d.event, d.attempt + 1)}
            onDelete={() => setDeleting(active)}
          />
        )}
      </D.Root>

      <CreateEndpointDialog
        open={creating}
        onOpenChange={setCreating}
        onCreate={(ep) => {
          setEndpoints((l) => [ep, ...l]);
          setOpenId(ep.id);
        }}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete endpoint?"
        description={`Events will no longer be sent to ${deleting?.url ?? "this endpoint"}. This can't be undone.`}
        onConfirm={() => {
          setEndpoints((l) => l.filter((e) => e.id !== deleting?.id));
          setOpenId(null);
          setDeleting(null);
          toast.success("Endpoint deleted");
        }}
      />
    </>
  );
}

function EndpointDrawer({
  ep,
  onPatch,
  onTest,
  onRetry,
  onDelete,
}: {
  ep: WebhookEndpoint;
  onPatch: (p: Partial<WebhookEndpoint>, message?: string) => void;
  onTest: (event: WebhookEvent) => void;
  onRetry: (d: WebhookDelivery) => void;
  onDelete: () => void;
}) {
  const [reveal, setReveal] = React.useState(false);
  const [testEvent, setTestEvent] = React.useState<WebhookEvent>(ep.events[0] ?? "order.created");
  const [selected, setSelected] = React.useState<WebhookDelivery | null>(null);

  return (
    <SheetContent className="max-w-2xl">
      <div className="border-b p-5 pr-12">
        <D.Title className="truncate font-mono text-base font-semibold">{ep.url}</D.Title>
        <D.Description className="text-sm text-muted-foreground">{ep.description || "No description"} · created {formatDate(ep.created)}</D.Description>
      </div>
      <div className="flex-1 space-y-6 overflow-y-auto p-5">
        <section>
          <Label>Signing secret</Label>
          <div className="mt-1.5 flex gap-2">
            <Input readOnly value={reveal ? ep.secret : "whsec_" + "•".repeat(24)} className="font-mono text-xs" aria-label="Signing secret" />
            <Button variant="outline" size="icon" onClick={() => setReveal((r) => !r)} aria-label={reveal ? "Hide secret" : "Reveal secret"}>{reveal ? <EyeOff /> : <Eye />}</Button>
            <CopyButton value={ep.secret} label="Copy secret" />
            <Button variant="outline" onClick={() => onPatch({ secret: newSecret() }, "Secret rotated. Update it in your endpoint.")}><RefreshCw /> Rotate</Button>
          </div>
        </section>

        <section>
          <Label>Send a test event</Label>
          <div className="mt-1.5 flex gap-2">
            <select
              value={testEvent}
              onChange={(e) => setTestEvent(e.target.value as WebhookEvent)}
              className="h-9 flex-1 rounded-md border border-input bg-card px-3 font-mono text-sm"
              aria-label="Test event type"
            >
              {webhookEvents.map((ev) => <option key={ev} value={ev}>{ev}</option>)}
            </select>
            <Button onClick={() => onTest(testEvent)} disabled={!ep.enabled}><Send /> Send test</Button>
          </div>
          {!ep.enabled && <p className="mt-1.5 text-xs text-muted-foreground">Enable the endpoint to send events.</p>}
        </section>

        <section>
          <Label>Events</Label>
          <EventPicker value={ep.events} onChange={(events) => events.length ? onPatch({ events }) : toast.error("Subscribe to at least one event")} className="mt-2" />
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <Label>Recent deliveries</Label>
            <span className="text-xs text-muted-foreground">{successRate(ep.deliveries)}% successful</span>
          </div>
          {ep.deliveries.length === 0 ? (
            <p className="rounded-lg border py-6 text-center text-sm text-muted-foreground">No deliveries yet. Send a test event.</p>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Event</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Time</TableHead><TableHead>When</TableHead><TableHead /></TableRow>
                </TableHeader>
                <TableBody>
                  {ep.deliveries.slice(0, 15).map((d) => (
                    <TableRow key={d.id} className="cursor-pointer" onClick={() => setSelected(d)}>
                      <TableCell className="font-mono text-xs">{d.event}</TableCell>
                      <TableCell>
                        <Badge variant={ok(d) ? "success" : "destructive"} className="tabular">{d.statusCode}</Badge>
                        {d.attempt > 1 && <span className="ml-1.5 text-xs text-muted-foreground">attempt {d.attempt}</span>}
                      </TableCell>
                      <TableCell className="text-right text-xs tabular text-muted-foreground">{d.durationMs} ms</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatRelative(d.at)}</TableCell>
                      <TableCell className="text-right">
                        {!ok(d) && (
                          <Button variant="ghost" size="sm" disabled={!ep.enabled} onClick={(e) => { e.stopPropagation(); onRetry(d); }}><RotateCcw /> Retry</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>

        {selected && (
          <section>
            <div className="mb-2 flex items-center justify-between">
              <Label>Payload · {selected.id}</Label>
              <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>Hide</Button>
            </div>
            <CodeBlock code={samplePayload(selected.event, selected.id)} />
          </section>
        )}
      </div>
      <div className="flex justify-between border-t p-4">
        <Button variant="ghost" className="text-destructive" onClick={onDelete}><Trash2 /> Delete endpoint</Button>
        <D.Close asChild><Button variant="outline">Close</Button></D.Close>
      </div>
    </SheetContent>
  );
}

function EventPicker({ value, onChange, className }: { value: WebhookEvent[]; onChange: (v: WebhookEvent[]) => void; className?: string }) {
  return (
    <div className={cn("grid gap-2 sm:grid-cols-2", className)}>
      {webhookEvents.map((ev) => (
        <label key={ev} className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent">
          <Checkbox checked={value.includes(ev)} onCheckedChange={(c) => onChange(c ? [...value, ev] : value.filter((x) => x !== ev))} />
          <span className="font-mono text-xs">{ev}</span>
        </label>
      ))}
    </div>
  );
}

function CreateEndpointDialog({ open, onOpenChange, onCreate }: { open: boolean; onOpenChange: (o: boolean) => void; onCreate: (ep: WebhookEndpoint) => void }) {
  const [events, setEvents] = React.useState<WebhookEvent[]>(["order.created", "order.paid"]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add webhook endpoint</DialogTitle>
          <DialogDescription>We&apos;ll send a signed POST request to this URL whenever a selected event happens.</DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
            let url: URL;
            try {
              url = new URL(f.url.trim());
            } catch {
              return toast.error("Enter a valid URL");
            }
            if (url.protocol !== "https:") return toast.error("Endpoints must use HTTPS");
            if (!events.length) return toast.error("Select at least one event");
            onCreate({ id: `we_${Date.now()}`, url: url.toString(), description: f.description.trim(), events, enabled: true, secret: newSecret(), created: new Date().toISOString(), deliveries: [] });
            onOpenChange(false);
            toast.success("Endpoint added. Copy its signing secret to verify requests.");
          }}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="wh-url">Endpoint URL</Label>
            <Input id="wh-url" name="url" placeholder="https://api.yourapp.com/webhooks" required autoFocus className="font-mono text-sm" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="wh-desc">Description</Label>
            <Input id="wh-desc" name="description" placeholder="e.g. Order fulfilment service" />
          </div>
          <div>
            <Label>Events to send</Label>
            <EventPicker value={events} onChange={setEvents} className="mt-2" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit"><Plus /> Add endpoint</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
