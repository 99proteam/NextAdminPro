import type { Metadata } from "next";
import { Suspense } from "react";
import { customers } from "@/lib/data";
import { CustomersView } from "@/components/customers/customers-view";
import { TableSkeleton } from "@/components/data-table/table-skeleton";

export const metadata: Metadata = { title: "Customers" };

export default function CustomersPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <CustomersView initial={customers} />
    </Suspense>
  );
}
