"use client";

import * as React from "react";
import { Archive, ArrowLeft, Inbox, Mail, PenSquare, Reply, Search, Send, ShieldAlert, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Message } from "@/lib/data";
import { formatRelative } from "@/lib/time";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { Tooltip } from "@/components/ui/tooltip";

type Folder = Message["folder"] | "starred";
const folders: { id: Folder; label: string; icon: typeof Inbox }[] = [
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "starred", label: "Starred", icon: Star },
  { id: "sent", label: "Sent", icon: Send },
  { id: "archive", label: "Archive", icon: Archive },
  { id: "spam", label: "Spam", icon: ShieldAlert },
];

const labelVariant = { work: "default", billing: "warning", support: "destructive", personal: "success" } as const;

export function InboxView({ initial }: { initial: Message[] }) {
  const [messages, setMessages] = React.useState(initial);
  const [folder, setFolder] = React.useState<Folder>("inbox");
  const [activeId, setActiveId] = React.useState<string | null>(initial[0]?.id ?? null);
  const [mobileReading, setMobileReading] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [composeOpen, setComposeOpen] = React.useState(false);
  const [reply, setReply] = React.useState("");

  const list = messages.filter(
    (m) =>
      (folder === "starred" ? m.starred : m.folder === folder) &&
      (!query || `${m.from} ${m.subject} ${m.preview}`.toLowerCase().includes(query.toLowerCase())),
  );
  const active = messages.find((m) => m.id === activeId);
  const count = (f: Folder) => messages.filter((m) => (f === "starred" ? m.starred : m.folder === f) && (f !== "inbox" || !m.read)).length;

  const patch = (id: string, p: Partial<Message>) => setMessages((ms) => ms.map((m) => (m.id === id ? { ...m, ...p } : m)));
  const open = (m: Message) => {
    setActiveId(m.id);
    setMobileReading(true);
    if (!m.read) patch(m.id, { read: true });
  };
  const moveTo = (m: Message, f: Message["folder"], msg: string) => {
    patch(m.id, { folder: f });
    toast.success(msg);
    setActiveId(list.find((x) => x.id !== m.id)?.id ?? null);
    setMobileReading(false);
  };

  return (
    <>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inbox</h1>
          <p className="mt-1 text-sm text-muted-foreground">Customer conversations and team mail in one place.</p>
        </div>
        <Button onClick={() => setComposeOpen(true)}><PenSquare /> Compose</Button>
      </div>

      <Card className="grid h-[calc(100svh-13rem)] min-h-[520px] overflow-hidden md:grid-cols-[200px_320px_1fr]">
        <nav className="hidden flex-col gap-0.5 border-r p-3 md:flex" aria-label="Folders">
          {folders.map((f) => {
            const n = count(f.id);
            return (
              <button
                key={f.id}
                onClick={() => setFolder(f.id)}
                className={cn(
                  "flex h-9 cursor-pointer items-center gap-3 rounded-md px-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground",
                  folder === f.id && "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary",
                )}
              >
                <f.icon className="size-4" /> {f.label}
                {n > 0 && <span className="ml-auto text-xs tabular">{n}</span>}
              </button>
            );
          })}
        </nav>

        <div className={cn("flex min-h-0 flex-col border-r", mobileReading && "hidden md:flex")}>
          <div className="flex gap-2 border-b p-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search mail" className="pl-9" aria-label="Search mail" />
            </div>
          </div>
          <div className="flex gap-1 overflow-x-auto border-b px-3 py-2 md:hidden">
            {folders.map((f) => (
              <Button key={f.id} size="sm" variant={folder === f.id ? "secondary" : "ghost"} onClick={() => setFolder(f.id)}>{f.label}</Button>
            ))}
          </div>
          <ul className="flex-1 overflow-y-auto">
            {list.length === 0 && <li className="p-8 text-center text-sm text-muted-foreground">Nothing here.</li>}
            {list.map((m) => (
              <li key={m.id}>
                <button
                  onClick={() => open(m)}
                  className={cn(
                    "flex w-full cursor-pointer flex-col gap-1 border-b px-4 py-3 text-left hover:bg-muted/50",
                    activeId === m.id && "bg-primary/5",
                  )}
                >
                  <div className="flex items-center gap-2">
                    {!m.read && <span className="size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
                    <span className={cn("truncate text-sm", !m.read ? "font-semibold" : "font-medium")}>{m.from}</span>
                    <span className="ml-auto shrink-0 text-xs text-muted-foreground">{formatRelative(m.receivedAt)}</span>
                  </div>
                  <p className={cn("truncate text-sm", !m.read ? "font-medium" : "text-foreground/90")}>{m.subject}</p>
                  <p className="line-clamp-1 text-xs text-muted-foreground">{m.preview}</p>
                  {m.label && <Badge variant={labelVariant[m.label]} className="mt-1 self-start capitalize">{m.label}</Badge>}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className={cn("min-h-0 flex-col", mobileReading ? "flex" : "hidden md:flex")}>
          {active ? (
            <>
              <div className="flex items-center gap-1 border-b p-2">
                <Button variant="ghost" size="icon-sm" className="md:hidden" onClick={() => setMobileReading(false)} aria-label="Back"><ArrowLeft /></Button>
                <Tooltip content="Archive"><Button variant="ghost" size="icon-sm" aria-label="Archive" onClick={() => moveTo(active, "archive", "Archived")}><Archive /></Button></Tooltip>
                <Tooltip content="Mark as spam"><Button variant="ghost" size="icon-sm" aria-label="Spam" onClick={() => moveTo(active, "spam", "Moved to spam")}><ShieldAlert /></Button></Tooltip>
                <Tooltip content="Delete"><Button variant="ghost" size="icon-sm" aria-label="Delete" onClick={() => { setMessages((ms) => ms.filter((x) => x.id !== active.id)); setActiveId(null); setMobileReading(false); toast.success("Deleted"); }}><Trash2 /></Button></Tooltip>
                <Tooltip content="Mark unread"><Button variant="ghost" size="icon-sm" aria-label="Mark unread" onClick={() => patch(active.id, { read: false })}><Mail /></Button></Tooltip>
                <Tooltip content={active.starred ? "Unstar" : "Star"}>
                  <Button variant="ghost" size="icon-sm" className="ml-auto" aria-label="Star" onClick={() => patch(active.id, { starred: !active.starred })}>
                    <Star className={cn(active.starred && "fill-chart-4 text-chart-4")} />
                  </Button>
                </Tooltip>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="flex items-start gap-3">
                  <Avatar name={active.from} className="size-10" />
                  <div className="min-w-0">
                    <p className="font-semibold">{active.from}</p>
                    <p className="text-xs text-muted-foreground">{active.email}</p>
                  </div>
                  <span className="ml-auto text-xs text-muted-foreground">{formatRelative(active.receivedAt)}</span>
                </div>
                <h2 className="mt-6 text-lg font-semibold">{active.subject}</h2>
                <p className="mt-4 whitespace-pre-line text-sm leading-relaxed">{active.body}</p>
              </div>
              <form
                className="flex flex-col gap-2 border-t p-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!reply.trim()) return;
                  toast.success(`Reply sent to ${active.from}`);
                  setReply("");
                }}
              >
                <Textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder={`Reply to ${active.from}…`} aria-label="Reply" />
                <Button type="submit" size="sm" className="self-end" disabled={!reply.trim()}><Reply /> Send reply</Button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
              <Mail className="size-8" /> Select a message to read
            </div>
          )}
        </div>
      </Card>

      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>New message</DialogTitle>
            <DialogDescription className="sr-only">Compose an email</DialogDescription>
          </DialogHeader>
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
              if (!/^\S+@\S+\.\S+$/.test(f.to)) return toast.error("Enter a valid recipient");
              setMessages((ms) => [
                { id: `msg_sent_${ms.length}`, from: "Alex Morgan", email: f.to, subject: f.subject || "(no subject)", preview: f.body.slice(0, 120), body: f.body, receivedAt: new Date().toISOString(), read: true, starred: false, folder: "sent" },
                ...ms,
              ]);
              setComposeOpen(false);
              toast.success("Message sent");
            }}
          >
            <Input name="to" type="email" placeholder="To" aria-label="To" />
            <Input name="subject" placeholder="Subject" aria-label="Subject" />
            <Textarea name="body" placeholder="Write your message…" className="min-h-40" aria-label="Message" />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setComposeOpen(false)}>Discard</Button>
              <Button type="submit"><Send /> Send</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
