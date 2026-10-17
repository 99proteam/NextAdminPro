"use client";

import * as React from "react";
import { Clock, DollarSign, Pause, Play, Timer, Users } from "lucide-react";
import { toast } from "sonner";
import { projects, timeEntries, type TimeEntry } from "@/lib/data/modules";
import { currentUser } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { CrudPage, type CrudApi } from "@/components/crud/crud-page";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const fmt = (s: number) => [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((n) => String(n).padStart(2, "0")).join(":");

function TimerBar({ api }: { api: CrudApi<TimeEntry> }) {
  const [running, setRunning] = React.useState(false);
  const [seconds, setSeconds] = React.useState(0);
  const [task, setTask] = React.useState("");
  const [project, setProject] = React.useState(projects[0].name);

  React.useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const stop = () => {
    setRunning(false);
    const hours = Math.max(0.25, Math.round((seconds / 3600) * 4) / 4);
    api.add({ id: `te_${Date.now()}`, date: new Date().toISOString().slice(0, 10), member: currentUser.name, project, task: task || "Untitled task", hours, billable: true });
    toast.success(`Logged ${hours}h on ${project}`);
    setSeconds(0);
    setTask("");
  };

  return (
    <Card className="mb-4 flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
      <Input value={task} onChange={(e) => setTask(e.target.value)} placeholder="What are you working on?" aria-label="Task" className="lg:flex-1" />
      <Select value={project} onValueChange={setProject}>
        <SelectTrigger className="lg:w-56" aria-label="Project"><SelectValue /></SelectTrigger>
        <SelectContent>{projects.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
      </Select>
      <span className="font-mono text-2xl font-semibold tabular lg:w-32 lg:text-center">{fmt(seconds)}</span>
      {running ? (
        <Button variant="destructive" onClick={stop}><Pause /> Stop &amp; log</Button>
      ) : (
        <Button onClick={() => setRunning(true)}><Play /> Start timer</Button>
      )}
    </Card>
  );
}

export function TimesheetsModule() {
  return (
    <CrudPage<TimeEntry>
      title="Timesheets"
      description="Track time with a live timer and review billable hours."
      entity="time entry"
      initial={timeEntries}
      exportName="timesheets"
      pageSize={20}
      initialSort={{ id: "date", desc: true }}
      searchText={(t) => `${t.member} ${t.project} ${t.task}`}
      stats={[
        { label: "Hours logged", icon: Clock, value: (r) => r.reduce((a, t) => a + t.hours, 0).toFixed(1) },
        { label: "Billable", icon: DollarSign, value: (r) => `${Math.round((r.filter((t) => t.billable).reduce((a, t) => a + t.hours, 0) / Math.max(1, r.reduce((a, t) => a + t.hours, 0))) * 100)}%` },
        { label: "Billable value", icon: Timer, value: (r) => `$${(r.filter((t) => t.billable).reduce((a, t) => a + t.hours, 0) * 120).toLocaleString()}`, hint: () => "at $120/hour" },
        { label: "Contributors", icon: Users, value: (r) => String(new Set(r.map((t) => t.member)).size) },
      ]}
      filters={[
        { id: "member", label: "Member", value: (t) => t.member, options: [...new Set(timeEntries.map((t) => t.member))].map((v) => ({ label: v, value: v })) },
        { id: "project", label: "Project", value: (t) => t.project, options: projects.map((p) => ({ label: p.name, value: p.name })) },
        { id: "billable", label: "Billable", value: (t) => (t.billable ? "yes" : "no"), options: [{ label: "Billable", value: "yes" }, { label: "Non-billable", value: "no" }] },
      ]}
      columns={[
        { id: "date", header: "Date", sortValue: (t) => t.date, cell: (t) => <span className="text-muted-foreground">{formatDate(t.date + "T00:00:00Z", { weekday: "short", month: "short", day: "numeric" })}</span> },
        { id: "member", header: "Member", sortValue: (t) => t.member, cell: (t) => <span className="flex items-center gap-2"><Avatar name={t.member} className="size-6 text-[10px]" />{t.member}</span> },
        { id: "project", header: "Project", sortValue: (t) => t.project, cell: (t) => <span className="font-medium">{t.project}</span> },
        { id: "task", header: "Task", sortValue: (t) => t.task, cell: (t) => <span className="text-muted-foreground">{t.task}</span> },
        { id: "billable", header: "Billable", sortValue: (t) => Number(t.billable), exportValue: (t) => (t.billable ? "yes" : "no"), cell: (t) => (t.billable ? <Badge variant="success">Billable</Badge> : <Badge variant="secondary">Internal</Badge>) },
        { id: "hours", header: "Hours", sortValue: (t) => t.hours, className: "text-right", headClassName: "text-right", cell: (t) => <span className="font-medium tabular">{t.hours.toFixed(2)}</span> },
      ]}
      fields={[
        { name: "date", label: "Date", type: "date", required: true },
        { name: "hours", label: "Hours", type: "number", step: "0.25", required: true },
        { name: "project", label: "Project", type: "select", options: projects.map((p) => p.name), full: true },
        { name: "task", label: "Task", required: true, full: true },
        { name: "billable", label: "Billable", type: "switch", full: true },
      ]}
      toForm={(t) => ({ ...t })}
      fromForm={(v, e) => ({ id: e?.id ?? `te_${Date.now()}`, date: String(v.date), hours: Number(v.hours) || 0, project: String(v.project), task: String(v.task), billable: Boolean(v.billable), member: e?.member ?? currentUser.name })}
    >
      {(api) => <TimerBar api={api} />}
    </CrudPage>
  );
}
