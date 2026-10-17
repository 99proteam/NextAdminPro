import type { Metadata } from "next";
import { PurchaseOrdersModule } from "@/components/modules/purchase-orders";

export const metadata: Metadata = { title: "Purchase orders" };

export default function Page() {
  return <PurchaseOrdersModule />;
}
