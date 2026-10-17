"use client";

import * as React from "react";
import { CheckCircle2, KanbanSquare, List, Target, Trophy, XCircle } from "lucide-react";
import { deals, type Deal, type DealStage } from "@/lib/data/modules";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { CrudPage, dateOnly } from "@/components/crud/crud-page";
import { StatusBadge } from "@/components/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const stages: DealStage[] = ["lead", "qualified", "proposal", "negotiation", "won", "lost"];
const probability: Record<DealStage, number> = { lead: 10, qualified: 25, proposal: 50, negotiation: 75, won: 100, lost: 0 };
const open = (d: Deal) => d.stage !== "won" && d.stage !== "lost";
// Fallback for browsers that don't expose dataTransfer data on drop.
let draggingId: string | null = null;

export function DealsModule() {
  const [view, setView] = React.useState<"board" | "table">("board");
  return (
    <CrudPage<Deal>
      title="Deals pipeline"
      description="Track opportunities from first contact to closed-won."
      entity="deal"
      initial={deals}
      exportName="deals"
      pageSize={view === "board" ? 100 : 10}
      initialSort={{ id: "value", desc: true }}
      searchText={(d) => `${d.title} ${d.company} ${d.contact} ${d.owner}`}
      stats={[
        { label: "Open pipeline", icon: Target, value: (r) => formatCurrency(r.filter(open).reduce((a, d) => a + d.value, 0), "USD", true), hint: (r) => `${r.filter(open).length} open deals` },
        { label: "Weighted forecast", icon: KanbanSquare, value: (r) => formatCurrency(r.filter(open).reduce((a, d) => a + (d.value * d.probability) / 100, 0), "USD", true), hint: () => "Value × win probability" },
        { label: "Won", icon: Trophy, tone: () => "success", value: (r) => formatCurrency(r.filter((d) => d.stage === "won").reduce((a, d) => a + d.value, 0), "USD", true), hint: (r) => `${r.filter((d) => d.stage === "won").length} deals` },
        { label: "Win rate", icon: CheckCircle2, value: (r) => { const closed = r.filter((d) => !open(d)); return closed.length ? `${Math.round((closed.filter((d) => d.stage === "won").length / closed.length) * 100)}%` : "—"; } },
      ]}
      filters={[
        { id: "stage", label: "Stage", value: (d) => d.stage, options: stages.map((s) => ({ label: s[0].toUpperCase() + s.slice(1), value: s })) },
        { id: "owner", label: "Owner", value: (d) => d.owner, options: [...new Set(deals.map((d) => d.owner))].map((o) => ({ label: o, value: o })) },
        { id: "source", label: "Source", value: (d) => d.source, options: ["Website", "Referral", "Outbound", "Event", "Partner"].map((s) => ({ label: s, value: s })) },
      ]}
      columns={[
        { id: "title", header: "Deal", hideable: false, sortValue: (d) => d.title, cell: (d) => <div><p className="font-medium">{d.title}</p><p className="text-xs text-muted-foreground">{d.contact} · {d.source}</p></div> },
        { id: "value", header: "Value", sortValue: (d) => d.value, cell: (d) => <span className="font-medium tabular">{formatCurrency(d.value, "USD")}</span> },
        { id: "stage", header: "Stage", sortValue: (d) => stages.indexOf(d.stage), exportValue: (d) => d.stage, cell: (d) => <StatusBadge status={d.stage} /> },
        { id: "probability", header: "Probability", sortValue: (d) => d.probability, exportValue: (d) => `${d.probability}%`, cell: (d) => <span className="tabular text-muted-foreground">{d.probability}%</span> },
        { id: "owner", header: "Owner", sortValue: (d) => d.owner, cell: (d) => <span className="flex items-center gap-2"><Avatar name={d.owner} className="size-6 text-[10px]" />{d.owner}</span> },
        { id: "close", header: "Close date", sortValue: (d) => d.closeDate, exportValue: (d) => dateOnly(d.closeDate), cell: (d) => <span className="text-muted-foreground">{formatDate(d.closeDate)}</span> },
      ]}
      bulkActions={[
        { label: "Mark won", icon: Trophy, apply: () => ({ stage: "won", probability: 100 }), message: (n) => `${n} deal${n > 1 ? "s" : ""} won 🎉` },
        { label: "Mark lost", icon: XCircle, apply: () => ({ stage: "lost", probability: 0 }), destructive: true },
      ]}
      fields={[
        { name: "title", label: "Deal name", required: true, full: true },
        { name: "company", label: "Company", required: true },
        { name: "contact", label: "Contact" },
        { name: "value", label: "Value (USD)", type: "number", required: true },
        { name: "stage", label: "Stage", type: "select", options: stages },
        { name: "owner", label: "Owner", type: "select", options: [...new Set(deals.map((d) => d.owner))] },
        { name: "source", label: "Source", type: "select", options: ["Website", "Referral", "Outbound", "Event", "Partner"] },
        { name: "closeDate", label: "Expected close", type: "date" },
      ]}
      toForm={(d) => ({ ...d, closeDate: dateOnly(d.closeDate) })}
      fromForm={(v, e) => {
        const stage = v.stage as DealStage;
        return {
          id: e?.id ?? `deal_${Date.now()}`,
          title: String(v.title),
          company: String(v.company),
          contact: String(v.contact) || "—",
          value: Number(v.value) || 0,
          stage,
          probability: probability[stage],
          owner: String(v.owner),
          source: v.source as Deal["source"],
          closeDate: v.closeDate ? new Date(String(v.closeDate)).toISOString() : new Date().toISOString(),
        };
      }}
      toolbarExtra={
        <div className="flex rounded-md border bg-card p-0.5">
          <Button variant="ghost" size="icon-sm" className={cn("h-7", view === "board" && "bg-muted")} onClick={() => setView("board")} aria-label="Board view" aria-pressed={view === "board"}><KanbanSquare /></Button>
          <Button variant="ghost" size="icon-sm" className={cn("h-7", view === "table" && "bg-muted")} onClick={() => setView("table")} aria-label="Table view" aria-pressed={view === "table"}><List /></Button>
        </div>
      }
      renderGrid={
        view === "board"
          ? (rows, api) => (
              <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                {stages.map((stage) => {
                  const list = rows.filter((d) => d.stage === stage);
                  return (
                    <section
                      key={stage}
                      aria-label={stage}
                      className="flex w-64 shrink-0 flex-col rounded-xl border bg-muted/40 2xl:w-auto 2xl:min-w-52 2xl:flex-1"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        const id = e.dataTransfer.getData("text/plain") || draggingId;
                        draggingId = null;
                        if (id) api.update(id, { stage, probability: probability[stage] }, `Moved to ${stage}`);
                      }}
                    >
                      <header className="px-3 py-2.5">
                        <div className="flex items-center justify-between">
                          <StatusBadge status={stage} />
                          <span className="text-xs text-muted-foreground tabular">{list.length}</span>
                        </div>
                        <p className="mt-1.5 text-sm font-semibold tabular">{formatCurrency(list.reduce((a, d) => a + d.value, 0), "USD", true)}</p>
                      </header>
                      <ul className="flex min-h-20 flex-col gap-2 px-2 pb-2">
                        {list.map((d) => (
                          <li key={d.id} draggable onDragStart={(e) => { draggingId = d.id; e.dataTransfer.setData("text/plain", d.id); }} className="relative cursor-grab active:cursor-grabbing">
                            <Card className="p-3">
                              <p className="text-sm font-medium leading-snug">{d.title}</p>
                              <p className="mt-1 text-xs text-muted-foreground">{d.contact}</p>
                              <div className="mt-3 flex items-center justify-between">
                                <span className="text-sm font-semibold tabular">{formatCurrency(d.value, "USD", true)}</span>
                                <Avatar name={d.owner} className="size-6 text-[10px]" />
                              </div>
                            </Card>
                          </li>
                        ))}
                      </ul>
                    </section>
                  );
                })}
              </div>
            )
          : undefined
      }
    />
  );
}
