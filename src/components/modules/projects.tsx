"use client";

import { AlertTriangle, CheckCircle2, FolderKanban, PauseCircle, Wallet } from "lucide-react";
import { projects, type Project } from "@/lib/data/modules";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { CrudPage, dateOnly } from "@/components/crud/crud-page";
import { StatusBadge } from "@/components/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

const statuses: Project["status"][] = ["planning", "active", "on-hold", "at-risk", "completed"];
const leads = [...new Set(projects.map((p) => p.lead))];

export function ProjectsModule() {
  return (
    <CrudPage<Project>
      title="Projects"
      description="Client and internal projects with progress, budget and team."
      entity="project"
      initial={projects}
      exportName="projects"
      initialSort={{ id: "due", desc: false }}
      searchText={(p) => `${p.name} ${p.client} ${p.lead}`}
      stats={[
        { label: "Active projects", icon: FolderKanban, value: (r) => String(r.filter((p) => p.status === "active").length) },
        { label: "At risk", icon: AlertTriangle, tone: (r) => (r.some((p) => p.status === "at-risk") ? "destructive" : "default"), value: (r) => String(r.filter((p) => p.status === "at-risk").length) },
        { label: "Completed", icon: CheckCircle2, tone: () => "success", value: (r) => String(r.filter((p) => p.status === "completed").length) },
        { label: "Budget used", icon: Wallet, value: (r) => `${Math.round((r.reduce((a, p) => a + p.spent, 0) / r.reduce((a, p) => a + p.budget, 0)) * 100)}%`, hint: (r) => `${formatCurrency(r.reduce((a, p) => a + p.spent, 0), "USD", true)} of ${formatCurrency(r.reduce((a, p) => a + p.budget, 0), "USD", true)}` },
      ]}
      filters={[
        { id: "status", label: "Status", value: (p) => p.status, options: statuses.map((v) => ({ label: v.replace("-", " "), value: v })) },
        { id: "lead", label: "Lead", value: (p) => p.lead, options: leads.map((v) => ({ label: v, value: v })) },
      ]}
      columns={[
        { id: "name", header: "Project", hideable: false, sortValue: (p) => p.name, cell: (p) => <div><p className="font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.client}</p></div> },
        { id: "status", header: "Status", sortValue: (p) => statuses.indexOf(p.status), exportValue: (p) => p.status, cell: (p) => <StatusBadge status={p.status} /> },
        { id: "progress", header: "Progress", sortValue: (p) => p.progress, exportValue: (p) => `${p.progress}%`, cell: (p) => <div className="flex w-36 items-center gap-2"><Progress value={p.progress} className="h-1.5" indicatorClassName={cn(p.status === "at-risk" && "bg-destructive", p.status === "completed" && "bg-success")} /><span className="w-9 text-right text-xs tabular text-muted-foreground">{p.progress}%</span></div> },
        { id: "budget", header: "Budget", sortValue: (p) => p.spent / p.budget, exportValue: (p) => `${p.spent}/${p.budget}`, cell: (p) => <div className="text-xs"><p className={cn("font-medium tabular", p.spent > p.budget && "text-destructive")}>{formatCurrency(p.spent, "USD", true)}</p><p className="text-muted-foreground">of {formatCurrency(p.budget, "USD", true)}</p></div> },
        { id: "team", header: "Team", exportValue: (p) => p.team.join("; "), cell: (p) => <div className="flex -space-x-2">{p.team.map((m) => <Avatar key={m} name={m} className="size-7 text-[10px] ring-2 ring-card" />)}</div> },
        { id: "due", header: "Due", sortValue: (p) => p.due, exportValue: (p) => dateOnly(p.due), cell: (p) => <span className="text-muted-foreground">{formatDate(p.due)}</span> },
      ]}
      rowActions={[
        { label: "Mark completed", icon: CheckCircle2, hidden: (p) => p.status === "completed", onSelect: (p, api) => api.update(p.id, { status: "completed", progress: 100 }, `${p.name} completed 🎉`) },
        { label: "Put on hold", icon: PauseCircle, hidden: (p) => p.status === "on-hold" || p.status === "completed", onSelect: (p, api) => api.update(p.id, { status: "on-hold" }, `${p.name} on hold`) },
      ]}
      fields={[
        { name: "name", label: "Project name", required: true, full: true },
        { name: "client", label: "Client", required: true },
        { name: "lead", label: "Project lead", type: "select", options: leads },
        { name: "status", label: "Status", type: "select", options: statuses },
        { name: "progress", label: "Progress (%)", type: "number" },
        { name: "budget", label: "Budget (USD)", type: "number" },
        { name: "due", label: "Due date", type: "date" },
      ]}
      toForm={(p) => ({ ...p, due: dateOnly(p.due) })}
      fromForm={(v, e) => ({
        id: e?.id ?? `prj_${Date.now()}`,
        name: String(v.name),
        client: String(v.client),
        lead: String(v.lead),
        status: v.status as Project["status"],
        progress: Math.min(100, Math.max(0, Number(v.progress) || 0)),
        budget: Number(v.budget) || 0,
        spent: e?.spent ?? 0,
        start: e?.start ?? new Date().toISOString(),
        due: v.due ? new Date(String(v.due)).toISOString() : new Date().toISOString(),
        team: e?.team ?? [String(v.lead)],
      })}
    />
  );
}
