import type { Metadata } from "next";
import { ExpensesModule } from "@/components/modules/expenses";

export const metadata: Metadata = { title: "Expenses" };

export default function Page() {
  return <ExpensesModule />;
}
