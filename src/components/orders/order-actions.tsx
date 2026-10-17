"use client";

import * as React from "react";
import { Printer, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import type { OrderStatus } from "@/lib/data";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmDialog } from "@/components/form-helpers";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const flow: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"];

export function OrderActions({ status: initial, total }: { status: OrderStatus; total: string }) {
  const [status, setStatus] = React.useState(initial);
  const [refundOpen, setRefundOpen] = React.useState(false);
  return (
    <div className="no-print flex flex-wrap items-center gap-2">
      <StatusBadge status={status} />
      <Select
        value={status}
        onValueChange={(v) => {
          setStatus(v as OrderStatus);
          toast.success(`Order marked ${v}`, { description: "The customer has been notified by email." });
        }}
      >
        <SelectTrigger className="h-8 w-40" aria-label="Update status"><SelectValue /></SelectTrigger>
        <SelectContent>
          {flow.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
        </SelectContent>
      </Select>
      <Button variant="outline" size="sm" onClick={() => window.print()}><Printer /> Print</Button>
      <Button variant="outline" size="sm" disabled={status === "refunded"} onClick={() => setRefundOpen(true)}><RotateCcw /> Refund</Button>
      <ConfirmDialog
        open={refundOpen}
        onOpenChange={setRefundOpen}
        title={`Refund ${total}?`}
        description="The full amount will be returned to the original payment method."
        confirmLabel="Issue refund"
        onConfirm={() => {
          setStatus("refunded");
          setRefundOpen(false);
          toast.success("Refund issued");
        }}
      />
    </div>
  );
}
