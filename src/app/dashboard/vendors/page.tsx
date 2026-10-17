import type { Metadata } from "next";
import { VendorsModule } from "@/components/modules/vendors";

export const metadata: Metadata = { title: "Vendors" };

export default function Page() {
  return <VendorsModule />;
}
