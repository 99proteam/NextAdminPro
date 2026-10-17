import type { Metadata } from "next";
import { orders } from "@/lib/data";
import { OrdersView } from "@/components/orders/orders-view";

export const metadata: Metadata = { title: "Orders" };

export default function OrdersPage() {
  return <OrdersView initial={orders} />;
}
