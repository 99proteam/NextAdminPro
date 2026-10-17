"use client";

import * as React from "react";
import { ArrowLeft, Hash, Info, Paperclip, Search, SendHorizontal, Smile } from "lucide-react";
import type { ChatChannel, ChatMessage } from "@/lib/data";
import { currentUser } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const quickEmoji = ["👍", "🎉", "🔥", "❤️", "😂", "🙌", "👀", "✅"];
const time = (iso: string) => new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" });

export function ChatView({ channels: initialChannels, messages: initialMessages }: { channels: ChatChannel[]; messages: ChatMessage[] }) {
  const [channels, setChannels] = React.useState(initialChannels);
  const [messages, setMessages] = React.useState(initialMessages);
  const [activeId, setActiveId] = React.useState(initialChannels[0].id);
  const [draft, setDraft] = React.useState("");
  const [filter, setFilter] = React.useState("");
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [typing, setTyping] = React.useState(false);
  const endRef = React.useRef<HTMLDivElement>(null);

  const active = channels.find((c) => c.id === activeId)!;
  const thread = messages.filter((m) => m.channelId === activeId);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [thread.length, activeId, typing]);

  const select = (id: string) => {
    setActiveId(id);
    setMobileOpen(true);
    setChannels((cs) => cs.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
  };

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setMessages((m) => [...m, { id: `m_${Date.now()}`, channelId: activeId, author: currentUser.name, body, at: new Date().toISOString() }]);
    setDraft("");
    // Simulated reply in direct messages so the demo feels alive
    if (active.kind === "dm") {
      const other = active.members.find((m) => m !== currentUser.name) ?? active.name;
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        setMessages((m) => [...m, { id: `m_${Date.now()}`, channelId: activeId, author: other, body: "Got it, thanks! 👍", at: new Date().toISOString() }]);
      }, 1400);
    }
  };

  const react = (id: string, emoji: string) =>
    setMessages((ms) =>
      ms.map((m) => {
        if (m.id !== id) return m;
        const existing = m.reactions?.find((r) => r.emoji === emoji);
        const reactions = existing
          ? m.reactions!.map((r) => (r.emoji === emoji ? { ...r, count: r.count + 1 } : r))
          : [...(m.reactions ?? []), { emoji, count: 1 }];
        return { ...m, reactions };
      }),
    );

  const list = (kind: ChatChannel["kind"]) =>
    channels.filter((c) => c.kind === kind && c.name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Chat</h1>
        <p className="mt-1 text-sm text-muted-foreground">Real-time team conversations, channels and direct messages.</p>
      </div>
      <Card className="grid h-[calc(100svh-13rem)] min-h-[520px] overflow-hidden md:grid-cols-[260px_1fr]">
        <aside className={cn("flex min-h-0 flex-col border-r", mobileOpen && "hidden md:flex")}>
          <div className="border-b p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Find a conversation" className="pl-9" aria-label="Find a conversation" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {(["channel", "dm"] as const).map((kind) => (
              <div key={kind} className="mb-3">
                <p className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{kind === "channel" ? "Channels" : "Direct messages"}</p>
                {list(kind).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => select(c.id)}
                    className={cn(
                      "flex h-9 w-full cursor-pointer items-center gap-2 rounded-md px-2 text-sm hover:bg-accent",
                      activeId === c.id && "bg-primary/10 text-primary hover:bg-primary/10",
                      c.unread > 0 && activeId !== c.id && "font-semibold",
                    )}
                  >
                    {c.kind === "channel" ? <Hash className="size-4 text-muted-foreground" /> : (
                      <span className="relative">
                        <Avatar name={c.name} className="size-6 text-[10px]" />
                        <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-card bg-success" />
                      </span>
                    )}
                    <span className="truncate">{c.name}</span>
                    {c.unread > 0 && activeId !== c.id && (
                      <span className="ml-auto rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground tabular">{c.unread}</span>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </aside>

        <section className={cn("min-h-0 flex-col", mobileOpen ? "flex" : "hidden md:flex")}>
          <header className="flex items-center gap-3 border-b px-4 py-3">
            <Button variant="ghost" size="icon-sm" className="md:hidden" onClick={() => setMobileOpen(false)} aria-label="Back"><ArrowLeft /></Button>
            {active.kind === "channel" ? <Hash className="size-5 text-muted-foreground" /> : <Avatar name={active.name} className="size-7" />}
            <div className="min-w-0">
              <p className="font-semibold">{active.name}</p>
              <p className="truncate text-xs text-muted-foreground">{active.kind === "channel" ? active.topic : "Active now"}</p>
            </div>
            <span className="ml-auto hidden text-xs text-muted-foreground sm:block">{active.members.length} members</span>
            <Button variant="ghost" size="icon-sm" aria-label="Details"><Info /></Button>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            {thread.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">No messages yet. Say hello 👋</p>}
            <ul className="flex flex-col gap-4">
              {thread.map((m) => {
                const mine = m.author === currentUser.name;
                return (
                  <li key={m.id} className={cn("group flex gap-3", mine && "flex-row-reverse")}>
                    <Avatar name={m.author} className="size-8" />
                    <div className={cn("flex max-w-[75%] flex-col gap-1", mine && "items-end")}>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{mine ? "You" : m.author}</span> · {time(m.at)}
                      </p>
                      <div className={cn("rounded-2xl px-3.5 py-2 text-sm", mine ? "rounded-tr-sm bg-primary text-primary-foreground" : "rounded-tl-sm bg-muted")}>{m.body}</div>
                      <div className="flex flex-wrap items-center gap-1">
                        {m.reactions?.map((r) => (
                          <button key={r.emoji} onClick={() => react(m.id, r.emoji)} className="cursor-pointer rounded-full border bg-card px-2 py-0.5 text-xs hover:bg-accent">
                            {r.emoji} <span className="tabular">{r.count}</span>
                          </button>
                        ))}
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="cursor-pointer rounded-full p-1 text-muted-foreground opacity-0 hover:bg-accent group-hover:opacity-100 focus-visible:opacity-100" aria-label="Add reaction">
                              <Smile className="size-3.5" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="flex w-auto gap-1 p-1.5" align={mine ? "end" : "start"}>
                            {quickEmoji.map((e) => (
                              <button key={e} onClick={() => react(m.id, e)} className="cursor-pointer rounded-md p-1.5 text-lg hover:bg-accent">{e}</button>
                            ))}
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </li>
                );
              })}
              {typing && (
                <li className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex gap-0.5">
                    {[0, 1, 2].map((i) => <span key={i} className="size-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: `${i * 120}ms` }} />)}
                  </span>
                  {active.name} is typing…
                </li>
              )}
            </ul>
            <div ref={endRef} />
          </div>

          <form onSubmit={send} className="flex items-center gap-2 border-t p-3">
            <Button type="button" variant="ghost" size="icon" aria-label="Attach file"><Paperclip /></Button>
            <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={`Message ${active.kind === "channel" ? "#" : ""}${active.name}`} aria-label="Message" />
            <Button type="submit" size="icon" disabled={!draft.trim()} aria-label="Send"><SendHorizontal /></Button>
          </form>
        </section>
      </Card>
    </>
  );
}
