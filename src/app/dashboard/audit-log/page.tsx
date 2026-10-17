import type { Metadata } from "next";
import { auditLogs } from "@/lib/data";
import { AuditLogView } from "@/components/admin/audit-log-view";

export const metadata: Metadata = { title: "Audit Log" };

export default function AuditLogPage() {
  return <AuditLogView logs={auditLogs} />;
}
