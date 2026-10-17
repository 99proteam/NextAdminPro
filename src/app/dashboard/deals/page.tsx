import type { Metadata } from "next";
import { DealsModule } from "@/components/modules/deals";

export const metadata: Metadata = { title: "Deals pipeline" };

export default function Page() {
  return <DealsModule />;
}
