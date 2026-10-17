"use client";

import type { AuditLog } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { formatRelative } from "@/lib/time";
import { DataTable, type Column } from "@/components/data-table/data-table";
import { StatusBadge } from "@/components/status-badge";
import { Avatar } from "@/components/ui/avatar";

export function AuditLogView({ logs }: { logs: AuditLog[] }) {
  const actors = [...new Set(logs.map((l) => l.actor))].sort();
  const columns: Column<AuditLog>[] = [
    {
      id: "event",
      header: "Event",
      hideable: false,
      sortValue: (l) => `${l.action} ${l.resource}`,
      cell: (l) => (
        <div className="flex items-center gap-3">
          <Avatar name={l.actor} className="size-7" />
          <p>
            <span className="font-medium">{l.actor}</span> <span className="text-muted-foreground">{l.action}</span> {l.resource}
          </p>
        </div>
      ),
    },
    { id: "severity", header: "Severity", sortValue: (l) => ["info", "warning", "critical"].indexOf(l.severity), exportValue: (l) => l.severity, cell: (l) => <StatusBadge status={l.severity} /> },
    { id: "ip", header: "IP address", sortValue: (l) => l.ip, cell: (l) => <span className="font-mono text-xs text-muted-foreground">{l.ip}</span> },
    {
      id: "time",
      header: "Time",
      sortValue: (l) => l.createdAt,
      cell: (l) => (
        <span className="text-muted-foreground" title={formatDate(l.createdAt, { dateStyle: "medium", timeStyle: "medium" })}>
          {formatRelative(l.createdAt)}
        </span>
      ),
    },
  ];
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Audit Log</h1>
        <p className="mt-1 text-sm text-muted-foreground">Every sign-in, change and export across your workspace.</p>
      </div>
      <DataTable
        data={logs}
        columns={columns}
        getRowId={(l) => l.id}
        searchPlaceholder="Search events…"
        searchText={(l) => `${l.actor} ${l.action} ${l.resource} ${l.ip}`}
        filters={[
          { id: "severity", label: "Severity", value: (l) => l.severity, options: ["info", "warning", "critical"].map((s) => ({ label: s[0].toUpperCase() + s.slice(1), value: s })) },
          { id: "actor", label: "User", value: (l) => l.actor, options: actors.map((a) => ({ label: a, value: a })) },
        ]}
        initialSort={{ id: "time", desc: true }}
        pageSize={20}
        exportName="audit-log"
      />
    </>
  );
}
