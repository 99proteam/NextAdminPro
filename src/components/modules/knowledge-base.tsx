"use client";

import { BookOpen, Eye, FolderOpen, Globe, ThumbsUp } from "lucide-react";
import { currentUser } from "@/lib/data";
import { articles, type Article } from "@/lib/data/modules";
import { cn, formatDate, formatNumber } from "@/lib/utils";
import { CrudPage } from "@/components/crud/crud-page";
import { StatusBadge } from "@/components/status-badge";
import { Card } from "@/components/ui/card";

const collections: Article["collection"][] = ["Getting started", "Account & billing", "Orders & shipping", "Integrations", "Troubleshooting"];

export function KnowledgeBaseModule() {
  return (
    <CrudPage<Article>
      title="Knowledge base"
      description="Help-center articles that let customers solve problems themselves."
      entity="article"
      initial={articles}
      exportName="knowledge-base"
      initialSort={{ id: "views", desc: true }}
      searchText={(a) => `${a.title} ${a.collection} ${a.author}`}
      stats={[
        { label: "Articles", icon: BookOpen, value: (r) => String(r.length), hint: (r) => `${r.filter((a) => a.status === "draft").length} drafts` },
        { label: "Views (30d)", icon: Eye, value: (r) => formatNumber(r.reduce((a, x) => a + x.views, 0), true) },
        { label: "Helpfulness", icon: ThumbsUp, tone: () => "success", value: (r) => `${Math.round(r.reduce((a, x) => a + x.helpful, 0) / r.length)}%` },
        { label: "Tickets deflected", icon: Globe, value: () => "1,284", hint: () => "Estimated this month" },
      ]}
      filters={[
        { id: "collection", label: "Collection", value: (a) => a.collection, options: collections.map((c) => ({ label: c, value: c })) },
        { id: "status", label: "Status", value: (a) => a.status, options: [{ label: "Published", value: "published" }, { label: "Draft", value: "draft" }] },
      ]}
      columns={[
        { id: "title", header: "Article", hideable: false, sortValue: (a) => a.title, cell: (a) => <div><p className="font-medium">{a.title}</p><p className="text-xs text-muted-foreground">{a.collection}</p></div> },
        { id: "views", header: "Views", sortValue: (a) => a.views, cell: (a) => <span className="tabular">{formatNumber(a.views)}</span> },
        { id: "helpful", header: "Helpful", sortValue: (a) => a.helpful, exportValue: (a) => `${a.helpful}%`, cell: (a) => <span className={cn("tabular", a.helpful < 75 ? "text-warning" : "text-success")}>{a.helpful}%</span> },
        { id: "author", header: "Author", sortValue: (a) => a.author, cell: (a) => <span className="text-muted-foreground">{a.author}</span> },
        { id: "updated", header: "Updated", sortValue: (a) => a.updated, exportValue: (a) => a.updated.slice(0, 10), cell: (a) => <span className="text-muted-foreground">{formatDate(a.updated)}</span> },
        { id: "status", header: "Status", sortValue: (a) => a.status, cell: (a) => <StatusBadge status={a.status} /> },
      ]}
      rowActions={[{ label: "Publish", icon: Globe, hidden: (a) => a.status === "published", onSelect: (a, api) => api.update(a.id, { status: "published", updated: new Date().toISOString() }, "Article published") }]}
      fields={[
        { name: "title", label: "Title", required: true, full: true },
        { name: "collection", label: "Collection", type: "select", options: collections },
        { name: "status", label: "Status", type: "select", options: ["draft", "published"] },
        { name: "body", label: "Content", type: "textarea", placeholder: "Write the article in Markdown…" },
      ]}
      toForm={(a) => ({ ...a })}
      fromForm={(v, e) => ({ id: e?.id ?? `kb_${Date.now()}`, title: String(v.title), collection: v.collection as Article["collection"], status: v.status as Article["status"], views: e?.views ?? 0, helpful: e?.helpful ?? 100, updated: new Date().toISOString(), author: e?.author ?? currentUser.name })}
    >
      {(api) => (
        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {collections.map((c) => (
            <Card key={c} className="flex items-center gap-3 p-4">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><FolderOpen className="size-4" /></span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{c}</p>
                <p className="text-xs text-muted-foreground">{api.rows.filter((a) => a.collection === c).length} articles</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </CrudPage>
  );
}
