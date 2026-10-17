import type { Metadata } from "next";
import { PayrollModule } from "@/components/modules/payroll";

export const metadata: Metadata = { title: "Payroll" };

export default function Page() {
  return <PayrollModule />;
}
