import type { Metadata } from "next";
import { ShipmentsModule } from "@/components/modules/shipments";

export const metadata: Metadata = { title: "Shipments" };

export default function Page() {
  return <ShipmentsModule />;
}
