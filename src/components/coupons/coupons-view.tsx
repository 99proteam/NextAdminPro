"use client";

import * as React from "react";
import { Copy, MoreHorizontal, Pause, Play, Plus, Shuffle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Coupon } from "@/lib/data";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import { DataTable, type Column } from "@/components/data-table/data-table";
import { ConfirmDialog } from "@/components/form-helpers";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusVariant: Record<Coupon["status"], BadgeVariant> = { active: "success", scheduled: "default", paused: "warning", expired: "secondary" };

const describe = (c: Coupon) => (c.type === "percent" ? `${c.value}% off` : c.type === "fixed" ? `${formatCurrency(c.value)} off` : "Free shipping");

function randomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export function CouponsView({ initial }: { initial: Coupon[] }) {
  const [data, setData] = React.useState(initial);
  const [open, setOpen] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [deleting, setDeleting] = React.useState<Coupon | null>(null);

  const setStatus = (c: Coupon, status: Coupon["status"]) => {
    setData((d) => d.map((x) => (x.id === c.id ? { ...x, status } : x)));
    toast.success(`${c.code} ${status === "paused" ? "paused" : "activated"}`);
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`Copied ${text}`);
    } catch {
      toast.error("Couldn’t access the clipboard");
    }
  };

  const columns: Column<Coupon>[] = [
    {
      id: "code",
      header: "Code",
      hideable: false,
      sortValue: (c) => c.code,
      cell: (c) => (
        <div>
          <button onClick={() => copy(c.code)} className="inline-flex cursor-pointer items-center gap-1.5 rounded border border-dashed px-2 py-0.5 font-mono text-xs font-semibold hover:bg-muted" title="Copy code">
            {c.code} <Copy className="size-3 text-muted-foreground" />
          </button>
          <p className="mt-1 text-xs text-muted-foreground">{c.description}</p>
        </div>
      ),
    },
    { id: "discount", header: "Discount", sortValue: (c) => c.value, exportValue: describe, cell: (c) => <span className="font-medium">{describe(c)}</span> },
    { id: "min", header: "Min. order", sortValue: (c) => c.minOrder, cell: (c) => <span className="tabular text-muted-foreground">{c.minOrder ? formatCurrency(c.minOrder) : "—"}</span> },
    {
      id: "usage",
      header: "Usage",
      sortValue: (c) => c.uses,
      cell: (c) => (
        <div className="w-36">
          <p className="text-xs tabular"><span className="font-medium">{formatNumber(c.uses)}</span> <span className="text-muted-foreground">/ {c.limit ? formatNumber(c.limit) : "∞"}</span></p>
          {c.limit && <Progress value={(c.uses / c.limit) * 100} className="mt-1 h-1.5" />}
        </div>
      ),
    },
    { id: "period", header: "Valid", sortValue: (c) => c.endsAt, exportValue: (c) => `${c.startsAt.slice(0, 10)} – ${c.endsAt.slice(0, 10)}`, cell: (c) => <span className="text-xs text-muted-foreground">{formatDate(c.startsAt, { month: "short", day: "numeric" })} – {formatDate(c.endsAt, { dateStyle: "medium" })}</span> },
    { id: "status", header: "Status", sortValue: (c) => c.status, cell: (c) => <Badge variant={statusVariant[c.status]} className="capitalize">{c.status}</Badge> },
    {
      id: "actions",
      header: "",
      hideable: false,
      className: "w-10",
      cell: (c) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${c.code}`}><MoreHorizontal /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => copy(c.code)}><Copy /> Copy code</DropdownMenuItem>
            {c.status === "active" && <DropdownMenuItem onSelect={() => setStatus(c, "paused")}><Pause /> Pause</DropdownMenuItem>}
            {c.status === "paused" && <DropdownMenuItem onSelect={() => setStatus(c, "active")}><Play /> Resume</DropdownMenuItem>}
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive onSelect={() => setDeleting(c)}><Trash2 /> Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const active = data.filter((c) => c.status === "active");
  const redemptions = data.reduce((a, c) => a + c.uses, 0);

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Coupons</h1>
          <p className="mt-1 text-sm text-muted-foreground">Discount codes, promotions and free-shipping offers.</p>
        </div>
        <Button onClick={() => { setCode(randomCode()); setOpen(true); }}><Plus /> Create coupon</Button>
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        {[
          ["Active coupons", String(active.length)],
          ["Total redemptions", formatNumber(redemptions)],
          ["Est. discount given", formatCurrency(redemptions * 11.4, "USD", true)],
        ].map(([l, v]) => (
          <Card key={l} className="p-5">
            <p className="text-sm text-muted-foreground">{l}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight tabular">{v}</p>
          </Card>
        ))}
      </div>

      <DataTable
        data={data}
        columns={columns}
        getRowId={(c) => c.id}
        searchPlaceholder="Search codes…"
        searchText={(c) => `${c.code} ${c.description}`}
        filters={[
          { id: "status", label: "Status", value: (c) => c.status, options: ["active", "scheduled", "paused", "expired"].map((s) => ({ label: s[0].toUpperCase() + s.slice(1), value: s })) },
          { id: "type", label: "Type", value: (c) => c.type, options: [{ label: "Percentage", value: "percent" }, { label: "Fixed amount", value: "fixed" }, { label: "Free shipping", value: "shipping" }] },
        ]}
        initialSort={{ id: "usage", desc: true }}
        exportName="coupons"
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create coupon</DialogTitle>
            <DialogDescription>Customers enter this code at checkout.</DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
              if (!/^[A-Z0-9_-]{3,20}$/.test(code)) return toast.error("Use 3–20 letters, numbers, - or _");
              if (data.some((c) => c.code === code)) return toast.error("That code already exists");
              const now = Date.now();
              setData((d) => [
                { id: `cpn_new_${d.length}`, code, description: f.description || "New promotion", type: f.type as Coupon["type"], value: Number(f.value) || 0, uses: 0, limit: f.limit ? Number(f.limit) : null, minOrder: Number(f.minOrder) || 0, status: "active", startsAt: new Date(now).toISOString(), endsAt: new Date(now + Number(f.days || 30) * 86_400_000).toISOString() },
                ...d,
              ]);
              setOpen(false);
              toast.success(`Coupon ${code} created`);
            }}
          >
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="code">Code</Label>
              <div className="flex gap-2">
                <Input id="code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="font-mono" />
                <Button type="button" variant="outline" size="icon" onClick={() => setCode(randomCode())} aria-label="Generate code"><Shuffle /></Button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" placeholder="e.g. Holiday sale" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Type</Label>
              <Select name="type" defaultValue="percent">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed amount</SelectItem>
                  <SelectItem value="shipping">Free shipping</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="value">Value</Label>
              <Input id="value" name="value" type="number" min={0} defaultValue={10} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="minOrder">Minimum order ($)</Label>
              <Input id="minOrder" name="minOrder" type="number" min={0} defaultValue={0} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="limit">Usage limit</Label>
              <Input id="limit" name="limit" type="number" min={1} placeholder="Unlimited" />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="days">Valid for (days)</Label>
              <Input id="days" name="days" type="number" min={1} defaultValue={30} />
            </div>
            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">Create coupon</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete ${deleting?.code}?`}
        description="Customers will no longer be able to use this code."
        onConfirm={() => {
          setData((d) => d.filter((c) => c.id !== deleting?.id));
          setDeleting(null);
          toast.success("Coupon deleted");
        }}
      />
    </>
  );
}
