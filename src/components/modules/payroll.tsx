"use client";

import { Banknote, Download, FileText, Landmark, Play, Users } from "lucide-react";
import { toast } from "sonner";
import { payrollRuns, type PayrollRun } from "@/lib/data/modules";
import { downloadCsv, formatCurrency, formatDate } from "@/lib/utils";
import { CrudPage } from "@/components/crud/crud-page";
import { StatusBadge } from "@/components/status-badge";

export function PayrollModule() {
  return (
    <CrudPage<PayrollRun>
      title="Payroll"
      description="Monthly pay runs with gross pay, taxes, benefits and net pay."
      entity="pay run"
      initial={payrollRuns}
      exportName="payroll"
      initialSort={{ id: "payDate", desc: true }}
      searchText={(p) => `${p.period} ${p.status}`}
      stats={[
        { label: "Last net payroll", icon: Banknote, value: (r) => formatCurrency([...r].filter((p) => p.status === "paid").sort((a, b) => b.payDate.localeCompare(a.payDate))[0]?.net ?? 0) },
        { label: "YTD gross", icon: Landmark, value: (r) => formatCurrency(r.filter((p) => p.status === "paid").reduce((a, p) => a + p.gross, 0), "USD", true) },
        { label: "YTD taxes", icon: FileText, value: (r) => formatCurrency(r.filter((p) => p.status === "paid").reduce((a, p) => a + p.taxes, 0), "USD", true) },
        { label: "Employees paid", icon: Users, value: (r) => String(r.at(-1)?.employees ?? 0) },
      ]}
      filters={[{ id: "status", label: "Status", value: (p) => p.status, options: ["draft", "scheduled", "processing", "paid"].map((v) => ({ label: v[0].toUpperCase() + v.slice(1), value: v })) }]}
      columns={[
        { id: "period", header: "Period", hideable: false, sortValue: (p) => p.payDate, cell: (p) => <span className="font-medium">{p.period}</span> },
        { id: "payDate", header: "Pay date", sortValue: (p) => p.payDate, exportValue: (p) => p.payDate.slice(0, 10), cell: (p) => <span className="text-muted-foreground">{formatDate(p.payDate)}</span> },
        { id: "employees", header: "Employees", sortValue: (p) => p.employees, cell: (p) => <span className="tabular">{p.employees}</span> },
        { id: "gross", header: "Gross", sortValue: (p) => p.gross, className: "text-right", headClassName: "text-right", cell: (p) => <span className="tabular">{formatCurrency(p.gross)}</span> },
        { id: "taxes", header: "Taxes", sortValue: (p) => p.taxes, className: "text-right", headClassName: "text-right", cell: (p) => <span className="tabular text-muted-foreground">{formatCurrency(p.taxes)}</span> },
        { id: "benefits", header: "Benefits", sortValue: (p) => p.benefits, className: "text-right", headClassName: "text-right", cell: (p) => <span className="tabular text-muted-foreground">{formatCurrency(p.benefits)}</span> },
        { id: "net", header: "Net pay", sortValue: (p) => p.net, className: "text-right", headClassName: "text-right", cell: (p) => <span className="font-semibold tabular">{formatCurrency(p.net)}</span> },
        { id: "status", header: "Status", sortValue: (p) => p.status, cell: (p) => <StatusBadge status={p.status} /> },
      ]}
      rowActions={[
        { label: "Run payroll", icon: Play, hidden: (p) => p.status !== "draft", onSelect: (p, api) => api.update(p.id, { status: "scheduled" }, `${p.period} payroll scheduled`) },
        { label: "Download payslips", icon: Download, onSelect: (p) => { downloadCsv(`payslips-${p.period.replace(" ", "-").toLowerCase()}.csv`, [{ ...p }]); toast.success("Payslips exported"); } },
      ]}
    />
  );
}
