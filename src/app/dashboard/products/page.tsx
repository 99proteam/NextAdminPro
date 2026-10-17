import type { Metadata } from "next";
import { Suspense } from "react";
import { products } from "@/lib/data";
import { ProductsView } from "@/components/products/products-view";
import { TableSkeleton } from "@/components/data-table/table-skeleton";

export const metadata: Metadata = { title: "Products" };

export default function ProductsPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <ProductsView initial={products} />
    </Suspense>
  );
}
