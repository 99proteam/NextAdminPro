"use client";

import { AlertTriangle, CheckCircle2, MapPin, Package, Truck } from "lucide-react";
import { toast } from "sonner";
import { shipments, type Shipment } from "@/lib/data/modules";
import { formatDate } from "@/lib/utils";
import { CrudPage } from "@/components/crud/crud-page";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";

const statuses: Shipment["status"][] = ["label-created", "in-transit", "out-for-delivery", "delivered", "exception"];

export function ShipmentsModule() {
  return (
    <CrudPage<Shipment>
      title="Shipments"
      description="Track parcels across carriers from warehouse to doorstep."
      entity="shipment"
      initial={shipments}
      exportName="shipments"
      initialSort={{ id: "shipped", desc: true }}
      searchText={(s) => `${s.tracking} ${s.order} ${s.customer} ${s.destination}`}
      stats={[
        { label: "In transit", icon: Truck, value: (r) => String(r.filter((s) => s.status === "in-transit" || s.status === "out-for-delivery").length) },
        { label: "Awaiting pickup", icon: Package, value: (r) => String(r.filter((s) => s.status === "label-created").length) },
        { label: "Delivered", icon: CheckCircle2, tone: () => "success", value: (r) => String(r.filter((s) => s.status === "delivered").length), hint: () => "On-time rate 96.4%" },
        { label: "Exceptions", icon: AlertTriangle, tone: (r) => (r.some((s) => s.status === "exception") ? "destructive" : "default"), value: (r) => String(r.filter((s) => s.status === "exception").length) },
      ]}
      filters={[
        { id: "status", label: "Status", value: (s) => s.status, options: statuses.map((v) => ({ label: v.replace(/-/g, " "), value: v })) },
        { id: "carrier", label: "Carrier", value: (s) => s.carrier, options: ["UPS", "FedEx", "DHL", "USPS"].map((v) => ({ label: v, value: v })) },
      ]}
      columns={[
        { id: "tracking", header: "Tracking", hideable: false, sortValue: (s) => s.tracking, cell: (s) => <div><p className="font-mono text-xs font-medium">{s.tracking}</p><p className="text-xs text-muted-foreground">Order {s.order}</p></div> },
        { id: "carrier", header: "Carrier", sortValue: (s) => s.carrier, cell: (s) => <Badge variant="outline">{s.carrier}</Badge> },
        { id: "customer", header: "Customer", sortValue: (s) => s.customer, cell: (s) => s.customer },
        { id: "route", header: "Route", sortValue: (s) => s.destination, exportValue: (s) => `${s.origin} → ${s.destination}`, cell: (s) => <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3.5" />{s.origin} → {s.destination}</span> },
        { id: "status", header: "Status", sortValue: (s) => statuses.indexOf(s.status), exportValue: (s) => s.status, cell: (s) => <StatusBadge status={s.status} /> },
        { id: "shipped", header: "Shipped", sortValue: (s) => s.shippedAt, exportValue: (s) => s.shippedAt.slice(0, 10), cell: (s) => <span className="text-muted-foreground">{formatDate(s.shippedAt)}</span> },
        { id: "eta", header: "ETA", sortValue: (s) => s.eta, exportValue: (s) => s.eta.slice(0, 10), cell: (s) => <span className="text-muted-foreground">{s.status === "delivered" ? "—" : formatDate(s.eta)}</span> },
        { id: "weight", header: "Weight", sortValue: (s) => s.weight, defaultHidden: true, cell: (s) => <span className="tabular">{s.weight} kg</span> },
      ]}
      rowActions={[
        { label: "Mark delivered", icon: CheckCircle2, hidden: (s) => s.status === "delivered", onSelect: (s, api) => api.update(s.id, { status: "delivered" }, `${s.tracking} delivered`) },
        { label: "Notify customer", icon: Truck, onSelect: (s) => toast.success(`Tracking update sent to ${s.customer}`) },
      ]}
      bulkActions={[{ label: "Mark delivered", icon: CheckCircle2, apply: () => ({ status: "delivered" }) }]}
    />
  );
}
