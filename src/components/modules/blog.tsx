"use client";

import { Eye, FileText, Globe, PenSquare, Send } from "lucide-react";
import { currentUser } from "@/lib/data";
import { posts, type Post } from "@/lib/data/modules";
import { formatDate, formatNumber } from "@/lib/utils";
import { CrudPage, dateOnly } from "@/components/crud/crud-page";
import { StatusBadge } from "@/components/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const categories = ["Product", "Engineering", "Design", "Growth", "Company"];
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function BlogModule() {
  return (
    <CrudPage<Post>
      title="Blog posts"
      description="A lightweight CMS for articles, announcements and SEO content."
      entity="post"
      initial={posts}
      exportName="blog-posts"
      initialSort={{ id: "date", desc: true }}
      searchText={(p) => `${p.title} ${p.category} ${p.tags.join(" ")} ${p.author}`}
      stats={[
        { label: "Published", icon: Globe, value: (r) => String(r.filter((p) => p.status === "published").length) },
        { label: "Drafts", icon: PenSquare, value: (r) => String(r.filter((p) => p.status === "draft").length) },
        { label: "Scheduled", icon: Send, value: (r) => String(r.filter((p) => p.status === "scheduled").length) },
        { label: "Total views", icon: Eye, value: (r) => formatNumber(r.reduce((a, p) => a + p.views, 0), true) },
      ]}
      filters={[
        { id: "status", label: "Status", value: (p) => p.status, options: ["draft", "scheduled", "published"].map((s) => ({ label: s[0].toUpperCase() + s.slice(1), value: s })) },
        { id: "category", label: "Category", value: (p) => p.category, options: categories.map((c) => ({ label: c, value: c })) },
      ]}
      columns={[
        { id: "title", header: "Post", hideable: false, sortValue: (p) => p.title, cell: (p) => <div className="flex items-center gap-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"><FileText className="size-4" /></span><div className="min-w-0"><p className="max-w-sm truncate font-medium">{p.title}</p><p className="font-mono text-xs text-muted-foreground">/blog/{p.slug}</p></div></div> },
        { id: "category", header: "Category", sortValue: (p) => p.category, cell: (p) => <Badge variant="outline">{p.category}</Badge> },
        { id: "tags", header: "Tags", exportValue: (p) => p.tags.join("; "), cell: (p) => <div className="flex gap-1">{p.tags.map((t) => <Badge key={t} variant="secondary">#{t}</Badge>)}</div> },
        { id: "author", header: "Author", sortValue: (p) => p.author, cell: (p) => <span className="flex items-center gap-2"><Avatar name={p.author} className="size-6 text-[10px]" />{p.author}</span> },
        { id: "views", header: "Views", sortValue: (p) => p.views, cell: (p) => <span className="tabular">{formatNumber(p.views)}</span> },
        { id: "status", header: "Status", sortValue: (p) => p.status, cell: (p) => <StatusBadge status={p.status} /> },
        { id: "date", header: "Date", sortValue: (p) => p.date, exportValue: (p) => dateOnly(p.date), cell: (p) => <span className="text-muted-foreground">{formatDate(p.date)}</span> },
      ]}
      rowActions={[{ label: "Publish now", icon: Globe, hidden: (p) => p.status === "published", onSelect: (p, api) => api.update(p.id, { status: "published", date: new Date().toISOString() }, `“${p.title}” is live`) }]}
      bulkActions={[{ label: "Publish", icon: Globe, apply: () => ({ status: "published" }) }]}
      fields={[
        { name: "title", label: "Title", required: true, full: true },
        { name: "excerpt", label: "Excerpt / meta description", type: "textarea" },
        { name: "category", label: "Category", type: "select", options: categories },
        { name: "status", label: "Status", type: "select", options: ["draft", "scheduled", "published"] },
        { name: "tags", label: "Tags (comma separated)", full: true, placeholder: "nextjs, dashboard" },
        { name: "date", label: "Publish date", type: "date" },
      ]}
      toForm={(p) => ({ ...p, tags: p.tags.join(", "), date: dateOnly(p.date) })}
      fromForm={(v, e) => ({ id: e?.id ?? `post_${Date.now()}`, title: String(v.title), slug: slugify(String(v.title)), excerpt: String(v.excerpt), category: String(v.category), status: v.status as Post["status"], tags: String(v.tags).split(",").map((t) => t.trim()).filter(Boolean), date: v.date ? new Date(String(v.date)).toISOString() : new Date().toISOString(), author: e?.author ?? currentUser.name, views: e?.views ?? 0 })}
    />
  );
}
