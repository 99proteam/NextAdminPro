"use client";

import { Building2, Mail, Star, Truck, Wallet } from "lucide-react";
import { vendors, type Vendor } from "@/lib/data/modules";
import { formatCurrency } from "@/lib/utils";
import { CrudPage } from "@/components/crud/crud-page";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";

const categories: Vendor["category"][] = ["Manufacturing", "Logistics", "Packaging", "Software", "Services"];
const terms: Vendor["terms"][] = ["Net 15", "Net 30", "Net 60", "Prepaid"];

export function VendorsModule() {
  return (
    <CrudPage<Vendor>
      title="Vendors"
      description="Suppliers, payment terms, ratings and annual spend."
      entity="vendor"
      initial={vendors}
      exportName="vendors"
      initialSort={{ id: "spend", desc: true }}
      searchText={(v) => `${v.name} ${v.contact} ${v.email} ${v.category} ${v.country}`}
      stats={[
        { label: "Active vendors", icon: Building2, value: (r) => String(r.filter((v) => v.status === "active").length) },
        { label: "Annual spend", icon: Wallet, value: (r) => formatCurrency(r.reduce((a, v) => a + v.spend, 0), "USD", true) },
        { label: "Avg. rating", icon: Star, value: (r) => (r.reduce((a, v) => a + v.rating, 0) / r.length).toFixed(1) },
        { label: "Pending onboarding", icon: Truck, tone: () => "warning", value: (r) => String(r.filter((v) => v.status === "pending").length) },
      ]}
      filters={[
        { id: "category", label: "Category", value: (v) => v.category, options: categories.map((c) => ({ label: c, value: c })) },
        { id: "status", label: "Status", value: (v) => v.status, options: ["active", "pending", "inactive"].map((s) => ({ label: s[0].toUpperCase() + s.slice(1), value: s })) },
      ]}
      columns={[
        { id: "name", header: "Vendor", hideable: false, sortValue: (v) => v.name, cell: (v) => <div><p className="font-medium">{v.name}</p><p className="text-xs text-muted-foreground">{v.contact} · {v.email}</p></div> },
        { id: "category", header: "Category", sortValue: (v) => v.category, cell: (v) => <Badge variant="outline">{v.category}</Badge> },
        { id: "country", header: "Country", sortValue: (v) => v.country, cell: (v) => <span className="text-muted-foreground">{v.country}</span> },
        { id: "terms", header: "Terms", sortValue: (v) => v.terms, cell: (v) => v.terms },
        { id: "rating", header: "Rating", sortValue: (v) => v.rating, cell: (v) => <span className="inline-flex items-center gap-1 tabular"><Star className="size-3.5 fill-chart-4 text-chart-4" />{v.rating}</span> },
        { id: "spend", header: "Spend (12m)", sortValue: (v) => v.spend, className: "text-right", headClassName: "text-right", cell: (v) => <span className="font-medium tabular">{formatCurrency(v.spend, "USD")}</span> },
        { id: "status", header: "Status", sortValue: (v) => v.status, cell: (v) => <StatusBadge status={v.status} /> },
      ]}
      rowActions={[{ label: "Email contact", icon: Mail, onSelect: (v) => { window.location.href = `mailto:${v.email}`; } }]}
      fields={[
        { name: "name", label: "Company name", required: true, full: true },
        { name: "contact", label: "Contact person" },
        { name: "email", label: "Email", type: "email" },
        { name: "category", label: "Category", type: "select", options: categories },
        { name: "terms", label: "Payment terms", type: "select", options: terms },
        { name: "country", label: "Country" },
        { name: "status", label: "Status", type: "select", options: ["active", "pending", "inactive"] },
      ]}
      toForm={(v) => ({ ...v })}
      fromForm={(v, e) => ({ id: e?.id ?? `ven_${Date.now()}`, name: String(v.name), contact: String(v.contact) || "—", email: String(v.email), category: v.category as Vendor["category"], terms: v.terms as Vendor["terms"], country: String(v.country) || "—", status: v.status as Vendor["status"], rating: e?.rating ?? 0, spend: e?.spend ?? 0 })}
    />
  );
}
