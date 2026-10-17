"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Dialog as D } from "radix-ui";
import { Clock, Globe, Mail, MessageCircle, Phone, Plus, Send, Sparkles, Timer, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import type { Priority, Ticket } from "@/lib/data";
import { currentUser } from "@/lib/data";
import { NOW } from "@/lib/data/seed";
import { cn } from "@/lib/utils";
import { formatRelative } from "@/lib/time";
import { DataTable, type Column } from "@/components/data-table/data-table";
import { FormField } from "@/components/form-helpers";
import { Avatar } from "@/components/ui/avatar";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, SheetContent } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusVariant: Record<Ticket["status"], BadgeVariant> = { open: "default", pending: "warning", resolved: "success", closed: "secondary" };
const priorityVariant: Record<Priority, BadgeVariant> = { low: "secondary", medium: "default", high: "warning", urgent: "destructive" };
const channelIcon: Record<Ticket["channel"], LucideIcon> = { email: Mail, chat: MessageCircle, phone: Phone, web: Globe };
const slaHours: Record<Priority, number> = { urgent: 2, high: 8, medium: 24, low: 72 };

const canned = [
  "Thanks for reaching out! I’m looking into this now and will get back to you shortly.",
  "I’ve issued a full refund. It should appear on your statement within 5–7 business days.",
  "Could you share your order number and a screenshot so I can investigate further?",
  "Great news, this has been resolved. Let us know if there’s anything else we can help with!",
];

export function SupportView({ initial, agents }: { initial: Ticket[]; agents: string[] }) {
  const params = useSearchParams();
  const [tickets, setTickets] = React.useState(initial);
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [newOpen, setNewOpen] = React.useState(params.get("new") === "1");
  const [reply, setReply] = React.useState("");
  const active = tickets.find((t) => t.id === openId);

  const patch = (id: string, p: Partial<Ticket>, msg?: string) => {
    setTickets((l) => l.map((t) => (t.id === id ? { ...t, ...p, updatedAt: new Date().toISOString() } : t)));
    if (msg) toast.success(msg);
  };

  const sla = (t: Ticket) => {
    if (t.status === "resolved" || t.status === "closed") return null;
    const due = new Date(t.createdAt).getTime() + slaHours[t.priority] * 3_600_000;
    const left = (due - NOW) / 3_600_000;
    return { breached: left < 0, label: left < 0 ? `Breached ${Math.abs(left).toFixed(0)}h ago` : `${left.toFixed(0)}h left` };
  };

  const counts = {
    open: tickets.filter((t) => t.status === "open").length,
    pending: tickets.filter((t) => t.status === "pending").length,
    unassigned: tickets.filter((t) => !t.assignee && t.status !== "closed").length,
    breached: tickets.filter((t) => sla(t)?.breached).length,
  };

  const columns: Column<Ticket>[] = [
    {
      id: "subject",
      header: "Ticket",
      hideable: false,
      sortValue: (t) => t.subject,
      cell: (t) => {
        const Icon = channelIcon[t.channel];
        return (
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground" title={t.channel}><Icon className="size-3.5" /></span>
            <div className="min-w-0">
              <p className="max-w-[320px] truncate font-medium">{t.subject}</p>
              <p className="text-xs text-muted-foreground">{t.number} · {t.customer}</p>
            </div>
          </div>
        );
      },
    },
    { id: "status", header: "Status", sortValue: (t) => t.status, cell: (t) => <Badge variant={statusVariant[t.status]} className="capitalize">{t.status}</Badge> },
    { id: "priority", header: "Priority", sortValue: (t) => ["low", "medium", "high", "urgent"].indexOf(t.priority), exportValue: (t) => t.priority, cell: (t) => <Badge variant={priorityVariant[t.priority]} className="capitalize">{t.priority}</Badge> },
    {
      id: "sla",
      header: "SLA",
      sortValue: (t) => new Date(t.createdAt).getTime() + slaHours[t.priority] * 3_600_000,
      exportValue: (t) => sla(t)?.label ?? "Met",
      cell: (t) => {
        const s = sla(t);
        return s ? <span className={cn("inline-flex items-center gap-1 text-xs", s.breached ? "font-medium text-destructive" : "text-muted-foreground")}><Timer className="size-3.5" />{s.label}</span> : <span className="text-xs text-muted-foreground">—</span>;
      },
    },
    { id: "assignee", header: "Assignee", sortValue: (t) => t.assignee ?? "", cell: (t) => (t.assignee ? <span className="flex items-center gap-2"><Avatar name={t.assignee} className="size-6 text-[10px]" />{t.assignee}</span> : <span className="text-xs italic text-muted-foreground">Unassigned</span>) },
    { id: "updated", header: "Updated", sortValue: (t) => t.updatedAt, cell: (t) => <span className="text-muted-foreground">{formatRelative(t.updatedAt)}</span> },
  ];

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Support</h1>
          <p className="mt-1 text-sm text-muted-foreground">Helpdesk tickets from email, chat, phone and web.</p>
        </div>
        <Button onClick={() => setNewOpen(true)}><Plus /> New ticket</Button>
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Open", counts.open, ""],
          ["Pending", counts.pending, ""],
          ["Unassigned", counts.unassigned, ""],
          ["SLA breached", counts.breached, counts.breached ? "text-destructive" : ""],
        ].map(([l, v, tone]) => (
          <Card key={l as string} className="p-5">
            <p className="text-sm text-muted-foreground">{l}</p>
            <p className={cn("mt-2 text-2xl font-semibold tracking-tight tabular", tone as string)}>{v}</p>
          </Card>
        ))}
      </div>

      <DataTable
        data={tickets}
        columns={columns}
        getRowId={(t) => t.id}
        searchPlaceholder="Search tickets…"
        searchText={(t) => `${t.number} ${t.subject} ${t.customer} ${t.email}`}
        filters={[
          { id: "status", label: "Status", value: (t) => t.status, options: ["open", "pending", "resolved", "closed"].map((s) => ({ label: s[0].toUpperCase() + s.slice(1), value: s })) },
          { id: "priority", label: "Priority", value: (t) => t.priority, options: ["urgent", "high", "medium", "low"].map((s) => ({ label: s[0].toUpperCase() + s.slice(1), value: s })) },
          { id: "channel", label: "Channel", value: (t) => t.channel, options: ["email", "chat", "phone", "web"].map((s) => ({ label: s[0].toUpperCase() + s.slice(1), value: s })) },
        ]}
        initialSort={{ id: "updated", desc: true }}
        exportName="support-tickets"
        onRowClick={(t) => setOpenId(t.id)}
        bulkActions={(rows, clear) => (
          <>
            <Button variant="outline" size="sm" onClick={() => { const ids = new Set(rows.map((r) => r.id)); setTickets((l) => l.map((t) => (ids.has(t.id) ? { ...t, assignee: currentUser.name } : t))); toast.success(`Assigned ${rows.length} to you`); clear(); }}>Assign to me</Button>
            <Button variant="outline" size="sm" onClick={() => { const ids = new Set(rows.map((r) => r.id)); setTickets((l) => l.map((t) => (ids.has(t.id) ? { ...t, status: "resolved" } : t))); toast.success(`Resolved ${rows.length}`); clear(); }}>Mark resolved</Button>
          </>
        )}
      />

      <D.Root open={!!active} onOpenChange={(o) => !o && setOpenId(null)}>
        {active && (
          <SheetContent className="max-w-xl">
            <div className="border-b p-5 pr-12">
              <D.Title className="text-lg font-semibold">{active.subject}</D.Title>
              <D.Description className="text-sm text-muted-foreground">{active.number} · opened {formatRelative(active.createdAt)} via {active.channel}</D.Description>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <Select value={active.status} onValueChange={(v) => patch(active.id, { status: v as Ticket["status"] }, `Status: ${v}`)}>
                  <SelectTrigger className="h-8 capitalize" aria-label="Status"><SelectValue /></SelectTrigger>
                  <SelectContent>{["open", "pending", "resolved", "closed"].map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={active.priority} onValueChange={(v) => patch(active.id, { priority: v as Priority }, `Priority: ${v}`)}>
                  <SelectTrigger className="h-8 capitalize" aria-label="Priority"><SelectValue /></SelectTrigger>
                  <SelectContent>{["low", "medium", "high", "urgent"].map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={active.assignee ?? "none"} onValueChange={(v) => patch(active.id, { assignee: v === "none" ? null : v }, v === "none" ? "Unassigned" : `Assigned to ${v}`)}>
                  <SelectTrigger className="h-8" aria-label="Assignee"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {agents.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <ol className="flex flex-col gap-4">
                {active.messages.map((m, i) => (
                  <li key={i} className={cn("flex gap-3", m.staff && "flex-row-reverse")}>
                    <Avatar name={m.from} className="size-8" />
                    <div className={cn("max-w-[80%] rounded-xl border p-3 text-sm", m.staff ? "border-primary/20 bg-primary/5" : "bg-card")}>
                      <p className="mb-1 text-xs text-muted-foreground"><span className="font-medium text-foreground">{m.from}</span>{m.staff && " · Staff"} · {formatRelative(m.at)}</p>
                      {m.body}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <form
              className="flex flex-col gap-2 border-t p-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (!reply.trim()) return;
                patch(active.id, { messages: [...active.messages, { from: currentUser.name, staff: true, body: reply, at: new Date().toISOString() }], status: active.status === "open" ? "pending" : active.status }, "Reply sent");
                setReply("");
              }}
            >
              <div className="flex flex-wrap gap-1">
                <span className="mr-1 inline-flex items-center gap-1 text-xs text-muted-foreground"><Sparkles className="size-3" /> Quick replies:</span>
                {canned.map((c, i) => (
                  <button key={i} type="button" onClick={() => setReply(c)} className="max-w-40 cursor-pointer truncate rounded-full border px-2 py-0.5 text-xs hover:bg-accent" title={c}>{c}</button>
                ))}
              </div>
              <Textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder={`Reply to ${active.customer}…`} aria-label="Reply" />
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Clock className="size-3" /> {active.email}</span>
                <Button type="submit" size="sm" disabled={!reply.trim()}><Send /> Send reply</Button>
              </div>
            </form>
          </SheetContent>
        )}
      </D.Root>

      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New ticket</DialogTitle>
            <DialogDescription>Log a request on behalf of a customer.</DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
              if (!f.subject.trim() || !/^\S+@\S+\.\S+$/.test(f.email)) return toast.error("Subject and a valid email are required");
              const n = 1200 + tickets.length;
              const now = new Date().toISOString();
              setTickets((l) => [{ id: `tkt_${n}`, number: `#${n}`, subject: f.subject, customer: f.customer || f.email, email: f.email, status: "open", priority: f.priority as Priority, channel: "web", assignee: null, createdAt: now, updatedAt: now, messages: [{ from: f.customer || f.email, staff: false, body: f.body || f.subject, at: now }] }, ...l]);
              setNewOpen(false);
              toast.success(`Ticket #${n} created`);
            }}
          >
            <div className="sm:col-span-2"><FormField label="Subject" name="subject" autoFocus /></div>
            <FormField label="Customer name" name="customer" />
            <FormField label="Customer email" name="email" type="email" />
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label>Priority</Label>
              <Select name="priority" defaultValue="medium">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["low", "medium", "high", "urgent"].map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="body">Message</Label>
              <Textarea id="body" name="body" />
            </div>
            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => setNewOpen(false)}>Cancel</Button>
              <Button type="submit">Create ticket</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
