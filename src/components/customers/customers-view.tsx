"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, MoreHorizontal, Pencil, Plus, Trash2, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";
import type { Customer } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DataTable, type Column } from "@/components/data-table/data-table";
import { StatusBadge } from "@/components/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { ConfirmDialog, FormField } from "@/components/form-helpers";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statuses = ["active", "inactive", "pending", "blocked"] as const;
const plans = ["Free", "Starter", "Pro", "Enterprise"] as const;

export function CustomersView({ initial }: { initial: Customer[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [data, setData] = React.useState(initial);
  const [editing, setEditing] = React.useState<Customer | null>(null);
  const [formOpen, setFormOpen] = React.useState(params.get("new") === "1");
  const [deleting, setDeleting] = React.useState<Customer[] | null>(null);

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const columns: Column<Customer>[] = [
    {
      id: "name",
      header: "Customer",
      hideable: false,
      sortValue: (c) => c.name,
      exportValue: (c) => c.name,
      cell: (c) => (
        <div className="flex items-center gap-3">
          <Avatar name={c.name} />
          <div className="min-w-0">
            <p className="font-medium">{c.name}</p>
            <p className="text-xs text-muted-foreground">{c.email}</p>
          </div>
        </div>
      ),
    },
    { id: "company", header: "Company", sortValue: (c) => c.company, cell: (c) => c.company },
    { id: "status", header: "Status", sortValue: (c) => c.status, cell: (c) => <StatusBadge status={c.status} /> },
    { id: "plan", header: "Plan", sortValue: (c) => c.plan, cell: (c) => <Badge variant="outline">{c.plan}</Badge> },
    { id: "location", header: "Location", sortValue: (c) => c.country, cell: (c) => <span className="text-muted-foreground">{c.city}, {c.country}</span> },
    { id: "orders", header: "Orders", sortValue: (c) => c.orders, cell: (c) => <span className="tabular">{c.orders}</span>, className: "text-right", headClassName: "text-right" },
    { id: "spent", header: "Total spent", sortValue: (c) => c.totalSpent, cell: (c) => <span className="font-medium tabular">{formatCurrency(c.totalSpent)}</span>, className: "text-right", headClassName: "text-right" },
    { id: "joined", header: "Joined", sortValue: (c) => c.joinedAt, exportValue: (c) => c.joinedAt.slice(0, 10), cell: (c) => <span className="text-muted-foreground">{formatDate(c.joinedAt)}</span>, defaultHidden: true },
    { id: "phone", header: "Phone", exportValue: (c) => c.phone, cell: (c) => c.phone, defaultHidden: true },
    {
      id: "actions",
      header: "",
      hideable: false,
      className: "w-10",
      cell: (c) => (
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${c.name}`}>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => router.push(`/dashboard/customers/${c.id}`)}><Eye /> View profile</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => { setEditing(c); setFormOpen(true); }}><Pencil /> Edit</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive onSelect={() => setDeleting([c])}><Trash2 /> Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const setStatus = (rows: Customer[], status: Customer["status"]) => {
    const ids = new Set(rows.map((r) => r.id));
    setData((d) => d.map((c) => (ids.has(c.id) ? { ...c, status } : c)));
    toast.success(`${rows.length} customer${rows.length > 1 ? "s" : ""} marked ${status}`);
  };

  const onSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    if (!f.name.trim() || !/^\S+@\S+\.\S+$/.test(f.email)) {
      toast.error("Please enter a name and a valid email");
      return;
    }
    if (editing) {
      setData((d) => d.map((c) => (c.id === editing.id ? { ...c, ...f, status: f.status as Customer["status"], plan: f.plan as Customer["plan"] } : c)));
      toast.success("Customer updated");
    } else {
      const created: Customer = {
        id: `cus_new_${data.length + 1}`,
        name: f.name,
        email: f.email,
        phone: f.phone,
        company: f.company || "—",
        country: f.country || "—",
        city: f.city || "—",
        status: f.status as Customer["status"],
        plan: f.plan as Customer["plan"],
        totalSpent: 0,
        orders: 0,
        joinedAt: new Date().toISOString(),
        lastSeenAt: new Date().toISOString(),
        tags: [],
      };
      setData((d) => [created, ...d]);
      toast.success("Customer created", { description: created.name });
    }
    setFormOpen(false);
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
          <p className="mt-1 text-sm text-muted-foreground">{data.length} customers · manage accounts, plans and lifetime value.</p>
        </div>
        <Button onClick={openNew}>
          <Plus /> Add customer
        </Button>
      </div>

      <DataTable
        data={data}
        columns={columns}
        getRowId={(c) => c.id}
        searchPlaceholder="Search name, email, company…"
        searchText={(c) => `${c.name} ${c.email} ${c.company} ${c.city}`}
        filters={[
          { id: "status", label: "Status", value: (c) => c.status, options: statuses.map((s) => ({ label: s[0].toUpperCase() + s.slice(1), value: s })) },
          { id: "plan", label: "Plan", value: (c) => c.plan, options: plans.map((p) => ({ label: p, value: p })) },
        ]}
        initialSort={{ id: "spent", desc: true }}
        exportName="customers"
        onRowClick={(c) => router.push(`/dashboard/customers/${c.id}`)}
        bulkActions={(rows, clear) => (
          <>
            <Button variant="outline" size="sm" onClick={() => { setStatus(rows, "active"); clear(); }}><UserCheck /> Activate</Button>
            <Button variant="outline" size="sm" onClick={() => { setStatus(rows, "blocked"); clear(); }}><UserX /> Block</Button>
            <Button variant="outline" size="sm" className="text-destructive" onClick={() => { setDeleting(rows); clear(); }}><Trash2 /> Delete</Button>
          </>
        )}
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit customer" : "Add customer"}</DialogTitle>
            <DialogDescription>{editing ? "Update the customer’s details." : "Create a new customer record."}</DialogDescription>
          </DialogHeader>
          <form key={editing?.id ?? "new"} onSubmit={onSave} className="grid gap-4 sm:grid-cols-2">
            <FormField label="Full name" name="name" defaultValue={editing?.name} required />
            <FormField label="Email" name="email" type="email" defaultValue={editing?.email} required />
            <FormField label="Phone" name="phone" defaultValue={editing?.phone} />
            <FormField label="Company" name="company" defaultValue={editing?.company} />
            <FormField label="City" name="city" defaultValue={editing?.city} />
            <FormField label="Country" name="country" defaultValue={editing?.country} />
            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Select name="status" defaultValue={editing?.status ?? "active"}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{statuses.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Plan</Label>
              <Select name="plan" defaultValue={editing?.plan ?? "Starter"}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{plans.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit">{editing ? "Save changes" : "Create customer"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete ${deleting?.length === 1 ? deleting[0].name : `${deleting?.length} customers`}?`}
        description="This permanently removes the customer and cannot be undone."
        onConfirm={() => {
          const ids = new Set(deleting?.map((d) => d.id));
          setData((d) => d.filter((c) => !ids.has(c.id)));
          toast.success("Deleted");
          setDeleting(null);
        }}
      />
    </>
  );
}
