import type { Metadata } from "next";
import { TransactionsModule } from "@/components/modules/transactions";

export const metadata: Metadata = { title: "Transactions" };

export default function Page() {
  return <TransactionsModule />;
}
