import type { Metadata } from "next";
import { EmployeesModule } from "@/components/modules/employees";

export const metadata: Metadata = { title: "Employees" };

export default function Page() {
  return <EmployeesModule />;
}
