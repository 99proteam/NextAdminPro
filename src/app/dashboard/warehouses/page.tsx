import type { Metadata } from "next";
import { WarehousesModule } from "@/components/modules/warehouses";

export const metadata: Metadata = { title: "Warehouses & stock" };

export default function Page() {
  return <WarehousesModule />;
}
