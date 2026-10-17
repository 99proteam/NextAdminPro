import type { Metadata } from "next";
import { ContractsModule } from "@/components/modules/contracts";

export const metadata: Metadata = { title: "Contracts" };

export default function Page() {
  return <ContractsModule />;
}
