"use client";

import { CheckCircle2, EyeOff, MessageSquareReply, Star, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { reviews, type Review } from "@/lib/data/modules";
import { cn, formatDate } from "@/lib/utils";
import { CrudPage } from "@/components/crud/crud-page";
import { StatusBadge } from "@/components/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => <Star key={i} className={cn("size-3.5", i <= value ? "fill-chart-4 text-chart-4" : "text-muted-foreground/40")} />)}
    </span>
  );
}

export function ReviewsModule() {
  return (
    <CrudPage<Review>
      title="Reviews"
      description="Moderate product reviews and reply to customers."
      entity="review"
      initial={reviews}
      exportName="reviews"
      initialSort={{ id: "date", desc: true }}
      searchText={(r) => `${r.product} ${r.customer} ${r.title} ${r.body}`}
      stats={[
        { label: "Average rating", icon: Star, value: (r) => (r.reduce((a, x) => a + x.rating, 0) / r.length).toFixed(2), hint: (r) => `${r.length} reviews` },
        { label: "Pending moderation", icon: EyeOff, tone: (r) => (r.some((x) => x.status === "pending") ? "warning" : "default"), value: (r) => String(r.filter((x) => x.status === "pending").length) },
        { label: "5-star share", icon: ThumbsUp, value: (r) => `${Math.round((r.filter((x) => x.rating === 5).length / r.length) * 100)}%` },
        { label: "Reply rate", icon: MessageSquareReply, value: (r) => `${Math.round((r.filter((x) => x.replied).length / r.length) * 100)}%` },
      ]}
      filters={[
        { id: "status", label: "Status", value: (r) => r.status, options: ["pending", "published", "hidden"].map((v) => ({ label: v[0].toUpperCase() + v.slice(1), value: v })) },
        { id: "rating", label: "Rating", value: (r) => String(r.rating), options: ["5", "4", "3", "2", "1"].map((v) => ({ label: `${v} stars`, value: v })) },
      ]}
      columns={[
        { id: "review", header: "Review", hideable: false, sortValue: (r) => r.title, exportValue: (r) => `${r.title}: ${r.body}`, cell: (r) => (
          <div className="max-w-md whitespace-normal">
            <div className="flex items-center gap-2"><Stars value={r.rating} /><span className="font-medium">{r.title}</span></div>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{r.body}</p>
          </div>
        ) },
        { id: "product", header: "Product", sortValue: (r) => r.product, cell: (r) => r.product },
        { id: "customer", header: "Customer", sortValue: (r) => r.customer, cell: (r) => <span className="flex items-center gap-2"><Avatar name={r.customer} className="size-6 text-[10px]" />{r.customer}{r.verified && <Badge variant="success" className="ml-1"><CheckCircle2 />Verified</Badge>}</span> },
        { id: "rating", header: "Rating", sortValue: (r) => r.rating, defaultHidden: true, cell: (r) => r.rating },
        { id: "status", header: "Status", sortValue: (r) => r.status, cell: (r) => <StatusBadge status={r.status} /> },
        { id: "date", header: "Date", sortValue: (r) => r.date, exportValue: (r) => r.date.slice(0, 10), cell: (r) => <span className="text-muted-foreground">{formatDate(r.date)}</span> },
      ]}
      rowActions={[
        { label: "Publish", icon: CheckCircle2, hidden: (r) => r.status === "published", onSelect: (r, api) => api.update(r.id, { status: "published" }, "Review published") },
        { label: "Hide", icon: EyeOff, hidden: (r) => r.status === "hidden", onSelect: (r, api) => api.update(r.id, { status: "hidden" }, "Review hidden") },
        { label: "Mark as replied", icon: MessageSquareReply, hidden: (r) => r.replied, onSelect: (r, api) => { api.update(r.id, { replied: true }); toast.success(`Reply sent to ${r.customer}`); } },
      ]}
      bulkActions={[
        { label: "Publish", icon: CheckCircle2, apply: () => ({ status: "published" }) },
        { label: "Hide", icon: EyeOff, apply: () => ({ status: "hidden" }) },
      ]}
    >
      {(api) => (
        <Card className="mb-4">
          <CardContent className="grid gap-6 p-5 sm:grid-cols-[180px_1fr]">
            <div className="text-center sm:border-r sm:pr-6">
              <p className="text-5xl font-semibold tracking-tight">{(api.rows.reduce((a, x) => a + x.rating, 0) / api.rows.length).toFixed(1)}</p>
              <div className="mt-2 flex justify-center"><Stars value={Math.round(api.rows.reduce((a, x) => a + x.rating, 0) / api.rows.length)} /></div>
              <p className="mt-1 text-xs text-muted-foreground">{api.rows.length} reviews</p>
            </div>
            <ul className="flex flex-col justify-center gap-1.5">
              {[5, 4, 3, 2, 1].map((n) => {
                const count = api.rows.filter((x) => x.rating === n).length;
                return (
                  <li key={n} className="flex items-center gap-3 text-sm">
                    <span className="w-10 tabular text-muted-foreground">{n} ★</span>
                    <div className="h-2 flex-1 rounded-full bg-muted"><div className="h-full rounded-full bg-chart-4" style={{ width: `${(count / api.rows.length) * 100}%` }} /></div>
                    <span className="w-8 text-right tabular text-muted-foreground">{count}</span>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}
    </CrudPage>
  );
}
