"use client";

import * as React from "react";
import { CalendarDays, MessageSquare, Paperclip, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import type { Priority, Task, TaskColumn } from "@/lib/data";
import { NOW } from "@/lib/data/seed";
import { cn, formatDate } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const columns: { id: TaskColumn; title: string }[] = [
  { id: "backlog", title: "Backlog" },
  { id: "todo", title: "To do" },
  { id: "in-progress", title: "In progress" },
  { id: "review", title: "In review" },
  { id: "done", title: "Done" },
];

const priorityVariant: Record<Priority, BadgeVariant> = {
  low: "secondary",
  medium: "default",
  high: "warning",
  urgent: "destructive",
};

export function KanbanBoard({ initial, assignees }: { initial: Task[]; assignees: string[] }) {
  const [tasks, setTasks] = React.useState(initial);
  const [dragId, setDragId] = React.useState<string | null>(null);
  const [overCol, setOverCol] = React.useState<TaskColumn | null>(null);
  const [query, setQuery] = React.useState("");
  const [assignee, setAssignee] = React.useState("all");
  const [newIn, setNewIn] = React.useState<TaskColumn | null>(null);

  const visible = tasks.filter(
    (t) =>
      (assignee === "all" || t.assignee === assignee) &&
      (!query || `${t.title} ${t.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase())),
  );

  const move = (id: string, column: TaskColumn, beforeId?: string) => {
    setTasks((list) => {
      const task = list.find((t) => t.id === id);
      if (!task) return list;
      const rest = list.filter((t) => t.id !== id);
      const moved = { ...task, column };
      const idx = beforeId ? rest.findIndex((t) => t.id === beforeId) : -1;
      if (idx === -1) return [...rest, moved];
      return [...rest.slice(0, idx), moved, ...rest.slice(idx)];
    });
  };

  const onCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    if (!f.title.trim()) return toast.error("Give the task a title");
    setTasks((t) => [
      ...t,
      {
        id: `tsk_new_${t.length + 1}`,
        title: f.title,
        description: f.description,
        column: newIn ?? "todo",
        priority: f.priority as Priority,
        assignee: f.assignee,
        dueAt: f.due ? new Date(f.due).toISOString() : new Date(NOW + 7 * 86_400_000).toISOString(),
        tags: [],
        comments: 0,
        attachments: 0,
      },
    ]);
    toast.success("Task created");
    setNewIn(null);
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
          <p className="mt-1 text-sm text-muted-foreground">Drag cards between columns to update their status.</p>
        </div>
        <Button onClick={() => setNewIn("todo")}><Plus /> New task</Button>
      </div>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter tasks…" className="pl-9" aria-label="Filter tasks" />
        </div>
        <Select value={assignee} onValueChange={setAssignee}>
          <SelectTrigger className="sm:w-52" aria-label="Assignee"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All assignees</SelectItem>
            {assignees.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        {columns.map((col) => {
          const items = visible.filter((t) => t.column === col.id);
          return (
            <section
              key={col.id}
              aria-label={col.title}
              onDragOver={(e) => {
                e.preventDefault();
                setOverCol(col.id);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setOverCol(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (dragId) move(dragId, col.id);
                setDragId(null);
                setOverCol(null);
              }}
              className={cn(
                "flex w-72 shrink-0 flex-col rounded-xl border bg-muted/40 transition-colors 2xl:w-auto 2xl:min-w-60 2xl:flex-1",
                overCol === col.id && "border-primary/50 bg-primary/5",
              )}
            >
              <header className="flex items-center gap-2 px-3 py-3">
                <h2 className="text-sm font-semibold">{col.title}</h2>
                <span className="rounded-full bg-card px-2 text-xs text-muted-foreground tabular">{items.length}</span>
                <Button variant="ghost" size="icon-sm" className="ml-auto" aria-label={`Add task to ${col.title}`} onClick={() => setNewIn(col.id)}>
                  <Plus />
                </Button>
              </header>
              <ul className="flex min-h-24 flex-1 flex-col gap-2 px-2 pb-2">
                {items.map((t) => {
                  const overdue = t.column !== "done" && new Date(t.dueAt).getTime() < NOW;
                  return (
                    <li
                      key={t.id}
                      draggable
                      onDragStart={(e) => {
                        setDragId(t.id);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragEnd={() => setDragId(null)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (dragId && dragId !== t.id) move(dragId, col.id, t.id);
                        setDragId(null);
                        setOverCol(null);
                      }}
                      className={cn(
                        "relative cursor-grab rounded-lg border bg-card p-3 shadow-xs transition-opacity active:cursor-grabbing",
                        dragId === t.id && "opacity-40",
                      )}
                    >
                      <div className="mb-2 flex flex-wrap gap-1">
                        <Badge variant={priorityVariant[t.priority]} className="capitalize">{t.priority}</Badge>
                        {t.tags.map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}
                      </div>
                      <p className={cn("text-sm font-medium", t.column === "done" && "text-muted-foreground line-through")}>{t.title}</p>
                      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className={cn("inline-flex items-center gap-1", overdue && "font-medium text-destructive")}>
                          <CalendarDays className="size-3.5" /> {formatDate(t.dueAt, { month: "short", day: "numeric" })}
                        </span>
                        {t.comments > 0 && <span className="inline-flex items-center gap-1"><MessageSquare className="size-3.5" />{t.comments}</span>}
                        {t.attachments > 0 && <span className="inline-flex items-center gap-1"><Paperclip className="size-3.5" />{t.attachments}</span>}
                        <Avatar name={t.assignee} className="ml-auto size-6 text-[10px]" />
                      </div>
                      <label className="sr-only">
                        Move “{t.title}” to
                        <select value={t.column} onChange={(e) => move(t.id, e.target.value as TaskColumn)}>
                          {columns.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      <Dialog open={!!newIn} onOpenChange={(o) => !o && setNewIn(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New task</DialogTitle>
            <DialogDescription>Adding to “{columns.find((c) => c.id === newIn)?.title}”.</DialogDescription>
          </DialogHeader>
          <form onSubmit={onCreate} className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" autoFocus />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Assignee</Label>
              <Select name="assignee" defaultValue={assignees[0]}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{assignees.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Priority</Label>
              <Select name="priority" defaultValue="medium">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{(["low", "medium", "high", "urgent"] as const).map((p) => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="due">Due date</Label>
              <Input id="due" name="due" type="date" />
            </div>
            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => setNewIn(null)}>Cancel</Button>
              <Button type="submit">Create task</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
