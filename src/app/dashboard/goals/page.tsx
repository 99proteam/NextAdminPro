import type { Metadata } from "next";
import { GoalsModule } from "@/components/modules/goals";

export const metadata: Metadata = { title: "Goals & OKRs" };

export default function Page() {
  return <GoalsModule />;
}
