import type { Metadata } from "next";
import { reports } from "@/lib/data";
import { ReportsView } from "@/components/reports/reports-view";

export const metadata: Metadata = { title: "Reports" };

export default function ReportsPage() {
  return <ReportsView initial={reports} />;
}
