"use client";

import { CalendarCheck, CalendarClock, CalendarX, Check, Plane, X } from "lucide-react";
import { employees, leaveRequests, type LeaveRequest } from "@/lib/data/modules";
import { formatDate } from "@/lib/utils";
import { CrudPage, dateOnly } from "@/components/crud/crud-page";
import { StatusBadge } from "@/components/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const types: LeaveRequest["type"][] = ["Vacation", "Sick", "Personal", "Parental", "Unpaid"];

export function TimeOffModule() {
  return (
    <CrudPage<LeaveRequest>
      title="Time off"
      description="Review and approve vacation, sick and personal leave."
      entity="request"
      initial={leaveRequests}
      exportName="time-off"
      initialSort={{ id: "from", desc: true }}
      searchText={(l) => `${l.employee} ${l.department} ${l.type} ${l.reason}`}
      stats={[
        { label: "Pending approval", icon: CalendarClock, tone: (r) => (r.some((l) => l.status === "pending") ? "warning" : "default"), value: (r) => String(r.filter((l) => l.status === "pending").length) },
        { label: "Approved days", icon: CalendarCheck, value: (r) => String(r.filter((l) => l.status === "approved").reduce((a, l) => a + l.days, 0)) },
        { label: "Rejected", icon: CalendarX, value: (r) => String(r.filter((l) => l.status === "rejected").length) },
        { label: "Out this week", icon: Plane, value: (r) => String(r.filter((l) => l.status === "approved" && Math.abs(new Date(l.from).getTime() - Date.UTC(2026, 9, 15)) < 7 * 86_400_000).length) },
      ]}
      filters={[
        { id: "status", label: "Status", value: (l) => l.status, options: ["pending", "approved", "rejected"].map((v) => ({ label: v[0].toUpperCase() + v.slice(1), value: v })) },
        { id: "type", label: "Type", value: (l) => l.type, options: types.map((v) => ({ label: v, value: v })) },
      ]}
      columns={[
        { id: "employee", header: "Employee", hideable: false, sortValue: (l) => l.employee, cell: (l) => <div className="flex items-center gap-3"><Avatar name={l.employee} /><div><p className="font-medium">{l.employee}</p><p className="text-xs text-muted-foreground">{l.department}</p></div></div> },
        { id: "type", header: "Type", sortValue: (l) => l.type, cell: (l) => <Badge variant="outline">{l.type}</Badge> },
        { id: "from", header: "Dates", sortValue: (l) => l.from, exportValue: (l) => `${dateOnly(l.from)} – ${dateOnly(l.to)}`, cell: (l) => <span>{formatDate(l.from, { month: "short", day: "numeric" })} – {formatDate(l.to, { dateStyle: "medium" })}</span> },
        { id: "days", header: "Days", sortValue: (l) => l.days, cell: (l) => <span className="tabular">{l.days}</span> },
        { id: "reason", header: "Reason", sortValue: (l) => l.reason, cell: (l) => <span className="text-muted-foreground">{l.reason}</span> },
        { id: "status", header: "Status", sortValue: (l) => l.status, cell: (l) => <StatusBadge status={l.status} /> },
      ]}
      rowActions={[
        { label: "Approve", icon: Check, hidden: (l) => l.status === "approved", onSelect: (l, api) => api.update(l.id, { status: "approved" }, `Approved ${l.employee}’s ${l.type.toLowerCase()} leave`) },
        { label: "Reject", icon: X, destructive: true, hidden: (l) => l.status === "rejected", onSelect: (l, api) => api.update(l.id, { status: "rejected" }, "Request rejected") },
      ]}
      bulkActions={[
        { label: "Approve", icon: Check, apply: () => ({ status: "approved" }) },
        { label: "Reject", icon: X, apply: () => ({ status: "rejected" }), destructive: true },
      ]}
      fields={[
        { name: "employee", label: "Employee", type: "select", options: employees.map((e) => e.name), full: true },
        { name: "type", label: "Leave type", type: "select", options: types },
        { name: "status", label: "Status", type: "select", options: ["pending", "approved", "rejected"] },
        { name: "from", label: "From", type: "date", required: true },
        { name: "to", label: "To", type: "date", required: true },
        { name: "reason", label: "Reason", type: "textarea" },
      ]}
      toForm={(l) => ({ ...l, from: dateOnly(l.from), to: dateOnly(l.to) })}
      fromForm={(v, e) => {
        const from = new Date(String(v.from));
        const to = new Date(String(v.to));
        const emp = employees.find((x) => x.name === v.employee);
        return {
          id: e?.id ?? `lv_${Date.now()}`,
          employee: String(v.employee),
          department: emp?.department ?? "Operations",
          type: v.type as LeaveRequest["type"],
          status: v.status as LeaveRequest["status"],
          from: from.toISOString(),
          to: to.toISOString(),
          days: Math.max(1, Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1),
          reason: String(v.reason) || "—",
        };
      }}
    />
  );
}
