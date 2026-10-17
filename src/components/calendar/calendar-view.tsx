"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Clock, Plus, Users } from "lucide-react";
import { toast } from "sonner";
import type { CalendarEvent } from "@/lib/data";
import { NOW } from "@/lib/data/seed";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const categoryStyle: Record<CalendarEvent["category"], { label: string; className: string; dot: string }> = {
  meeting: { label: "Meeting", className: "bg-chart-1/12 text-chart-1 border-chart-1/30", dot: "bg-chart-1" },
  deadline: { label: "Deadline", className: "bg-destructive/10 text-destructive border-destructive/30", dot: "bg-destructive" },
  event: { label: "Event", className: "bg-chart-3/12 text-chart-3 border-chart-3/30", dot: "bg-chart-3" },
  personal: { label: "Personal", className: "bg-chart-5/15 text-chart-5 border-chart-5/30", dot: "bg-chart-5" },
};

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const ymd = (d: Date) => d.toISOString().slice(0, 10);
const today = ymd(new Date(NOW));

export function CalendarView({ initial }: { initial: CalendarEvent[] }) {
  const [events, setEvents] = React.useState(initial);
  const [cursor, setCursor] = React.useState(() => {
    const d = new Date(NOW);
    return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
  });
  const [selected, setSelected] = React.useState(today);
  const [creating, setCreating] = React.useState<string | null>(null);

  const first = new Date(Date.UTC(cursor.year, cursor.month, 1));
  const offset = (first.getUTCDay() + 6) % 7; // Monday-first grid
  const days = Array.from({ length: 42 }, (_, i) => new Date(Date.UTC(cursor.year, cursor.month, i - offset + 1)));
  const monthLabel = first.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
  const byDay = React.useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    [...events].sort((a, b) => a.start.localeCompare(b.start)).forEach((e) => map.set(e.date, [...(map.get(e.date) ?? []), e]));
    return map;
  }, [events]);

  const shift = (n: number) =>
    setCursor((c) => {
      const d = new Date(Date.UTC(c.year, c.month + n, 1));
      return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
    });

  const upcoming = events.filter((e) => e.date >= today).sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start)).slice(0, 6);
  const selectedEvents = byDay.get(selected) ?? [];

  const onCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    if (!f.title.trim()) return toast.error("Event title is required");
    setEvents((list) => [
      ...list,
      { id: `evt_new_${list.length}`, title: f.title, date: f.date, start: f.start, end: f.end, category: f.category as CalendarEvent["category"], attendees: ["Alex Morgan"] },
    ]);
    setSelected(f.date);
    setCreating(null);
    toast.success("Event added");
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
          <p className="mt-1 text-sm text-muted-foreground">Meetings, deadlines and events for your team.</p>
        </div>
        <Button onClick={() => setCreating(selected)}><Plus /> New event</Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <Card className="overflow-hidden">
          <div className="flex items-center gap-2 border-b p-4">
            <h2 className="text-lg font-semibold">{monthLabel}</h2>
            <div className="ml-auto flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={() => { const d = new Date(NOW); setCursor({ year: d.getUTCFullYear(), month: d.getUTCMonth() }); setSelected(today); }}>Today</Button>
              <Button variant="outline" size="icon-sm" onClick={() => shift(-1)} aria-label="Previous month"><ChevronLeft /></Button>
              <Button variant="outline" size="icon-sm" onClick={() => shift(1)} aria-label="Next month"><ChevronRight /></Button>
            </div>
          </div>
          <div className="grid grid-cols-7 border-b text-center text-xs font-medium text-muted-foreground">
            {weekdays.map((d) => <div key={d} className="py-2">{d}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {days.map((d) => {
              const key = ymd(d);
              const inMonth = d.getUTCMonth() === cursor.month;
              const list = byDay.get(key) ?? [];
              return (
                <button
                  key={key}
                  onClick={() => setSelected(key)}
                  onDoubleClick={() => setCreating(key)}
                  className={cn(
                    "flex min-h-16 cursor-pointer flex-col gap-1 border-b border-r p-1.5 text-left transition-colors hover:bg-muted/50 sm:min-h-28 [&:nth-child(7n)]:border-r-0",
                    !inMonth && "bg-muted/30 text-muted-foreground",
                    selected === key && "bg-primary/5 ring-2 ring-inset ring-primary/40",
                  )}
                  aria-label={`${d.toDateString()}, ${list.length} events`}
                >
                  <span className={cn("flex size-6 items-center justify-center rounded-full text-xs font-medium tabular", key === today && "bg-primary text-primary-foreground")}>
                    {d.getUTCDate()}
                  </span>
                  <div className="hidden flex-col gap-0.5 sm:flex">
                    {list.slice(0, 2).map((e) => (
                      <span key={e.id} className={cn("truncate rounded border px-1.5 py-0.5 text-[11px] font-medium", categoryStyle[e.category].className)}>
                        {e.start} {e.title}
                      </span>
                    ))}
                    {list.length > 2 && <span className="px-1 text-[11px] text-muted-foreground">+{list.length - 2} more</span>}
                  </div>
                  <div className="flex gap-0.5 sm:hidden">
                    {list.slice(0, 3).map((e) => <span key={e.id} className={cn("size-1.5 rounded-full", categoryStyle[e.category].dot)} />)}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>{new Date(selected + "T00:00:00Z").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" })}</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedEvents.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-6 text-center text-sm text-muted-foreground">
                  No events scheduled.
                  <Button size="sm" variant="outline" onClick={() => setCreating(selected)}><Plus /> Add event</Button>
                </div>
              ) : (
                <ul className="flex flex-col gap-3">
                  {selectedEvents.map((e) => <EventRow key={e.id} event={e} />)}
                </ul>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Upcoming</CardTitle></CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-3">
                {upcoming.map((e) => <EventRow key={e.id} event={e} showDate />)}
              </ul>
            </CardContent>
          </Card>
          <Card className="p-4">
            <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
              {Object.values(categoryStyle).map((c) => (
                <li key={c.label} className="flex items-center gap-1.5"><span className={cn("size-2.5 rounded-full", c.dot)} />{c.label}</li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <Dialog open={!!creating} onOpenChange={(o) => !o && setCreating(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New event</DialogTitle>
            <DialogDescription>Tip: double-click a day in the calendar to create an event.</DialogDescription>
          </DialogHeader>
          <form key={creating} onSubmit={onCreate} className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="ev-title">Title</Label>
              <Input id="ev-title" name="title" autoFocus />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ev-date">Date</Label>
              <Input id="ev-date" name="date" type="date" defaultValue={creating ?? today} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Category</Label>
              <Select name="category" defaultValue="meeting">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(categoryStyle).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ev-start">Starts</Label>
              <Input id="ev-start" name="start" type="time" defaultValue="10:00" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ev-end">Ends</Label>
              <Input id="ev-end" name="end" type="time" defaultValue="11:00" required />
            </div>
            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => setCreating(null)}>Cancel</Button>
              <Button type="submit">Add event</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function EventRow({ event: e, showDate }: { event: CalendarEvent; showDate?: boolean }) {
  return (
    <li className="flex gap-3">
      <span className={cn("mt-1 w-1 shrink-0 self-stretch rounded-full", categoryStyle[e.category].dot)} />
      <div className="min-w-0 text-sm">
        <p className="font-medium">{e.title}</p>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="size-3" />
          {showDate && `${new Date(e.date + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })} · `}
          {e.start}–{e.end}
        </p>
        <p className="flex items-center gap-1 text-xs text-muted-foreground"><Users className="size-3" /> {e.attendees.join(", ")}</p>
      </div>
    </li>
  );
}
