import type { Metadata } from "next";
import { customers, invoices } from "@/lib/data";
import { InvoicesView } from "@/components/invoices/invoices-view";

export const metadata: Metadata = { title: "Invoices" };

export default function InvoicesPage() {
  return <InvoicesView initial={invoices} customers={customers} />;
}
