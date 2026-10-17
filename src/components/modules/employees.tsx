"use client";

import { Briefcase, Mail, UserCheck, UserPlus, Users, Wallet } from "lucide-react";
import { employees, type Employee } from "@/lib/data/modules";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CrudPage, dateOnly } from "@/components/crud/crud-page";
import { StatusBadge } from "@/components/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const departments: Employee["department"][] = ["Engineering", "Sales", "Marketing", "Support", "Finance", "Operations", "People"];
const managers = [...new Set(employees.map((e) => e.manager))];

export function EmployeesModule() {
  return (
    <CrudPage<Employee>
      title="Employees"
      description="Your team directory: roles, departments, compensation and status."
      entity="employee"
      initial={employees}
      exportName="employees"
      initialSort={{ id: "name", desc: false }}
      searchText={(e) => `${e.name} ${e.email} ${e.title} ${e.department} ${e.location}`}
      stats={[
        { label: "Headcount", icon: Users, value: (r) => String(r.filter((e) => e.status !== "terminated").length), hint: (r) => `${new Set(r.map((e) => e.department)).size} departments` },
        { label: "Onboarding", icon: UserPlus, value: (r) => String(r.filter((e) => e.status === "onboarding").length) },
        { label: "On leave", icon: UserCheck, tone: () => "warning", value: (r) => String(r.filter((e) => e.status === "on-leave").length) },
        { label: "Annual payroll", icon: Wallet, value: (r) => formatCurrency(r.filter((e) => e.status !== "terminated").reduce((a, e) => a + e.salary, 0), "USD", true) },
      ]}
      filters={[
        { id: "department", label: "Department", value: (e) => e.department, options: departments.map((d) => ({ label: d, value: d })) },
        { id: "status", label: "Status", value: (e) => e.status, options: ["active", "onboarding", "on-leave", "terminated"].map((v) => ({ label: v.replace("-", " "), value: v })) },
        { id: "type", label: "Type", value: (e) => e.type, options: ["Full-time", "Part-time", "Contractor"].map((v) => ({ label: v, value: v })) },
      ]}
      columns={[
        { id: "name", header: "Employee", hideable: false, sortValue: (e) => e.name, cell: (e) => <div className="flex items-center gap-3"><Avatar name={e.name} /><div><p className="font-medium">{e.name}</p><p className="text-xs text-muted-foreground">{e.email}</p></div></div> },
        { id: "title", header: "Role", sortValue: (e) => e.title, cell: (e) => <div><p>{e.title}</p><p className="text-xs text-muted-foreground">{e.department}</p></div> },
        { id: "type", header: "Type", sortValue: (e) => e.type, cell: (e) => <Badge variant="outline">{e.type}</Badge> },
        { id: "location", header: "Location", sortValue: (e) => e.location, cell: (e) => <span className="text-muted-foreground">{e.location}</span> },
        { id: "manager", header: "Manager", sortValue: (e) => e.manager, defaultHidden: true, cell: (e) => e.manager },
        { id: "salary", header: "Salary", sortValue: (e) => e.salary, cell: (e) => <span className="tabular">{formatCurrency(e.salary, "USD")}</span> },
        { id: "start", header: "Start date", sortValue: (e) => e.startDate, exportValue: (e) => dateOnly(e.startDate), cell: (e) => <span className="text-muted-foreground">{formatDate(e.startDate)}</span> },
        { id: "status", header: "Status", sortValue: (e) => e.status, cell: (e) => <StatusBadge status={e.status} /> },
      ]}
      rowActions={[{ label: "Send email", icon: Mail, onSelect: (e) => { window.location.href = `mailto:${e.email}`; } }]}
      bulkActions={[{ label: "Mark active", icon: Briefcase, apply: () => ({ status: "active" }) }]}
      fields={[
        { name: "name", label: "Full name", required: true },
        { name: "email", label: "Work email", type: "email", required: true },
        { name: "title", label: "Job title", required: true },
        { name: "department", label: "Department", type: "select", options: departments },
        { name: "type", label: "Employment type", type: "select", options: ["Full-time", "Part-time", "Contractor"] },
        { name: "status", label: "Status", type: "select", options: ["onboarding", "active", "on-leave", "terminated"] },
        { name: "location", label: "Location", placeholder: "City, Country" },
        { name: "manager", label: "Manager", type: "select", options: managers },
        { name: "salary", label: "Annual salary (USD)", type: "number" },
        { name: "startDate", label: "Start date", type: "date" },
      ]}
      toForm={(e) => ({ ...e, startDate: dateOnly(e.startDate) })}
      fromForm={(v, e) => ({
        id: e?.id ?? `emp_${Date.now()}`,
        name: String(v.name),
        email: String(v.email),
        title: String(v.title),
        department: v.department as Employee["department"],
        type: v.type as Employee["type"],
        status: v.status as Employee["status"],
        location: String(v.location) || "Remote",
        manager: String(v.manager),
        salary: Number(v.salary) || 0,
        startDate: v.startDate ? new Date(String(v.startDate)).toISOString() : new Date().toISOString(),
      })}
    />
  );
}
