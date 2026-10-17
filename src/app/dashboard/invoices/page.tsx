import type { Metadata } from "next";
import { Suspense } from "react";
import { customers, invoices } from "@/lib/data";
import { InvoicesView } from "@/components/invoices/invoices-view";
import { TableSkeleton } from "@/components/data-table/table-skeleton";

export const metadata: Metadata = { title: "Invoices" };

export default function InvoicesPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <InvoicesView initial={invoices} customers={customers} />
    </Suspense>
  );
}
