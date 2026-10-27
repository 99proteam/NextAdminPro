"use client";

import * as React from "react";
import { AlertTriangle, CheckCircle2, ClipboardCheck, Flag, Target, TrendingUp } from "lucide-react";
import { goalProgress, goals, goalStatus, type Goal, type KeyResult } from "@/lib/data/modules";
import { cn, formatDate, formatNumber } from "@/lib/utils";
import { CrudPage, dateOnly, type CrudApi } from "@/components/crud/crud-page";
import { StatusBadge } from "@/components/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

const teams: Goal["team"][] = ["Company", "Sales", "Marketing", "Product", "Engineering", "Support"];
const quarters = ["Q3 2026", "Q4 2026", "Q1 2027"];
const statuses: Goal["status"][] = ["on-track", "at-risk", "off-track", "completed"];
const owners = [...new Set(goals.map((g) => g.owner))];

const barTone = (status: Goal["status"]) =>
  cn(status === "at-risk" && "bg-warning", status === "off-track" && "bg-destructive", status === "completed" && "bg-success");

const formatValue = (v: number, unit: string) =>
  unit === "$" ? `$${formatNumber(v, v >= 10000)}` : unit === "%" ? `${v}%` : `${formatNumber(v, v >= 10000)} ${unit}`;

/** Key results are edited as one line each: `Title | current/target | unit`. */
function keyResultsToText(krs: KeyResult[]) {
  return krs.map((k) => `${k.title} | ${k.current}/${k.target} | ${k.unit}`).join("\n");
}

function parseKeyResults(text: string, prefix: string): KeyResult[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line, i) => {
      const [title, nums = "", unit = ""] = line.split("|").map((s) => s.trim());
      const [a, b] = nums.split("/").map((n) => Number(n.replace(/[^\d.]/g, "")) || 0);
      const hasCurrent = nums.includes("/");
      return { id: `${prefix}_${i + 1}`, title, current: hasCurrent ? a : 0, target: (hasCurrent ? b : a) || 100, unit };
    });
}

export function GoalsModule() {
  const [checkIn, setCheckIn] = React.useState<{ goal: Goal; api: CrudApi<Goal> } | null>(null);

  return (
    <>
      <CrudPage<Goal>
        title="Goals & OKRs"
        description="Objectives and measurable key results for every team. Click a goal to check in progress."
        entity="goal"
        initial={goals}
        exportName="goals"
        initialSort={{ id: "progress", desc: true }}
        searchText={(g) => `${g.objective} ${g.owner} ${g.team} ${g.keyResults.map((k) => k.title).join(" ")}`}
        searchPlaceholder="Search objectives and key results"
        stats={[
          { label: "Goals this quarter", icon: Target, value: (r) => String(r.filter((g) => g.quarter === "Q4 2026").length) },
          { label: "Avg. progress", icon: TrendingUp, value: (r) => `${Math.round(r.reduce((a, g) => a + goalProgress(g), 0) / Math.max(1, r.length))}%` },
          { label: "At risk or off track", icon: AlertTriangle, tone: (r) => (r.some((g) => g.status === "off-track") ? "destructive" : "warning"), value: (r) => String(r.filter((g) => g.status === "at-risk" || g.status === "off-track").length) },
          { label: "Completed", icon: CheckCircle2, tone: () => "success", value: (r) => String(r.filter((g) => g.status === "completed").length) },
        ]}
        filters={[
          { id: "quarter", label: "Quarter", value: (g) => g.quarter, options: quarters.map((q) => ({ label: q, value: q })) },
          { id: "team", label: "Team", value: (g) => g.team, options: teams.map((t) => ({ label: t, value: t })) },
          { id: "status", label: "Status", value: (g) => g.status, options: statuses.map((s) => ({ label: s.replace("-", " "), value: s })) },
        ]}
        columns={[
          {
            id: "objective",
            header: "Objective",
            hideable: false,
            sortValue: (g) => g.objective,
            cell: (g) => (
              <div className="max-w-sm">
                <p className="font-medium">{g.objective}</p>
                <p className="text-xs text-muted-foreground">{g.keyResults.length} key results · {g.keyResults.filter((k) => k.current >= k.target).length} achieved</p>
              </div>
            ),
          },
          { id: "team", header: "Team", sortValue: (g) => g.team, cell: (g) => <Badge variant="outline">{g.team}</Badge> },
          { id: "owner", header: "Owner", sortValue: (g) => g.owner, cell: (g) => <span className="inline-flex items-center gap-2"><Avatar name={g.owner} className="size-6 text-[10px]" />{g.owner}</span> },
          {
            id: "progress",
            header: "Progress",
            sortValue: (g) => goalProgress(g),
            exportValue: (g) => `${goalProgress(g)}%`,
            cell: (g) => (
              <div className="flex w-36 items-center gap-2">
                <Progress value={goalProgress(g)} className="h-1.5" indicatorClassName={barTone(g.status)} />
                <span className="w-9 text-right text-xs tabular text-muted-foreground">{goalProgress(g)}%</span>
              </div>
            ),
          },
          { id: "status", header: "Status", sortValue: (g) => statuses.indexOf(g.status), exportValue: (g) => g.status, cell: (g) => <StatusBadge status={g.status} /> },
          { id: "quarter", header: "Quarter", sortValue: (g) => g.due, exportValue: (g) => g.quarter, cell: (g) => <span className="text-muted-foreground">{g.quarter}</span> },
          { id: "updated", header: "Last check-in", defaultHidden: true, sortValue: (g) => g.updated, exportValue: (g) => dateOnly(g.updated), cell: (g) => <span className="text-muted-foreground">{formatDate(g.updated)}</span> },
        ]}
        onRowClick={(goal, api) => setCheckIn({ goal, api })}
        rowActions={[
          { label: "Check in", icon: ClipboardCheck, hidden: (g) => g.status === "completed", onSelect: (goal, api) => setCheckIn({ goal, api }) },
          { label: "Mark completed", icon: Flag, hidden: (g) => g.status === "completed", onSelect: (g, api) => api.update(g.id, { status: "completed", keyResults: g.keyResults.map((k) => ({ ...k, current: Math.max(k.current, k.target) })) }, `“${g.objective}” completed 🎉`) },
        ]}
        fields={[
          { name: "objective", label: "Objective", required: true, full: true, placeholder: "e.g. Grow recurring revenue" },
          { name: "team", label: "Team", type: "select", options: teams },
          { name: "owner", label: "Owner", type: "select", options: owners },
          { name: "quarter", label: "Quarter", type: "select", options: quarters },
          { name: "due", label: "Due date", type: "date" },
          { name: "keyResults", label: "Key results (one per line: title | current/target | unit)", type: "textarea", full: true, placeholder: "Monthly recurring revenue | 0/250000 | $\nEnterprise deals closed | 12 | deals" },
        ]}
        toForm={(g) => ({ ...g, due: dateOnly(g.due), keyResults: keyResultsToText(g.keyResults) })}
        fromForm={(v, e) => {
          const id = e?.id ?? `goal_${Date.now()}`;
          const keyResults = parseKeyResults(String(v.keyResults ?? ""), id);
          const quarter = String(v.quarter || quarters[1]);
          return {
            id,
            objective: String(v.objective),
            team: (v.team || "Company") as Goal["team"],
            owner: String(v.owner || owners[0]),
            quarter,
            keyResults,
            status: goalStatus(goalProgress({ keyResults }), quarter),
            due: v.due ? new Date(String(v.due)).toISOString() : new Date().toISOString(),
            updated: new Date().toISOString(),
          };
        }}
      >
        {(api) => <TeamProgress rows={api.rows} />}
      </CrudPage>
      {checkIn && <CheckInDialog key={checkIn.goal.id} state={checkIn} onClose={() => setCheckIn(null)} />}
    </>
  );
}

function TeamProgress({ rows }: { rows: Goal[] }) {
  const current = rows.filter((g) => g.quarter === "Q4 2026");
  const byTeam = teams
    .map((team) => {
      const list = current.filter((g) => g.team === team);
      return { team, count: list.length, progress: list.length ? Math.round(list.reduce((a, g) => a + goalProgress(g), 0) / list.length) : 0 };
    })
    .filter((t) => t.count > 0);
  if (!byTeam.length) return null;
  return (
    <Card className="mb-6 p-5">
      <h2 className="text-sm font-medium">Q4 2026 progress by team</h2>
      <div className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        {byTeam.map((t) => (
          <div key={t.team}>
            <div className="mb-1.5 flex justify-between text-xs">
              <span>{t.team} <span className="text-muted-foreground">· {t.count} goal{t.count === 1 ? "" : "s"}</span></span>
              <span className="tabular text-muted-foreground">{t.progress}%</span>
            </div>
            <Progress value={t.progress} className="h-1.5" />
          </div>
        ))}
      </div>
    </Card>
  );
}

function CheckInDialog({ state, onClose }: { state: { goal: Goal; api: CrudApi<Goal> }; onClose: () => void }) {
  const { goal } = state;
  const [values, setValues] = React.useState(() => goal.keyResults.map((k) => k.current));

  const draft = goal.keyResults.map((k, i) => ({ ...k, current: values[i] ?? k.current }));
  const progress = goalProgress({ keyResults: draft });
  const status = goalStatus(progress, goal.quarter);

  const save = () => {
    state.api.update(goal.id, { keyResults: draft, status, updated: new Date().toISOString() }, `Check-in saved · ${progress}%`);
    onClose();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{goal.objective}</DialogTitle>
          <DialogDescription>{goal.team} · {goal.owner} · {goal.quarter}. Update the current value of each key result.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {draft.map((k, i) => {
            const pct = Math.min(100, Math.round((k.current / (k.target || 1)) * 100));
            return (
              <div key={k.id} className="rounded-lg border p-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium">{k.title} <span className="font-normal text-muted-foreground">· target {formatValue(k.target, k.unit)}</span></p>
                  <span className="shrink-0 text-xs tabular text-muted-foreground">{pct}%</span>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <Progress value={pct} className="h-1.5" indicatorClassName={pct >= 100 ? "bg-success" : undefined} />
                  <Input
                    type="number"
                    step="any"
                    min={0}
                    value={values[i] ?? k.current}
                    onChange={(e) => setValues((v) => v.map((x, j) => (j === i ? Number(e.target.value) || 0 : x)))}
                    className="h-8 w-32 tabular"
                    aria-label={`Current value for ${k.title}`}
                  />
                </div>
              </div>
            );
          })}
          {!draft.length && <p className="text-sm text-muted-foreground">This goal has no key results yet. Edit it to add some.</p>}
        </div>
        <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
          <span>Overall progress <b className="tabular">{progress}%</b></span>
          <StatusBadge status={status} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save}><ClipboardCheck /> Save check-in</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
