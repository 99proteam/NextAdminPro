import type { Metadata } from "next";
import { Suspense } from "react";
import { team, tickets } from "@/lib/data";
import { SupportView } from "@/components/support/support-view";
import { TableSkeleton } from "@/components/data-table/table-skeleton";

export const metadata: Metadata = { title: "Support" };

export default function SupportPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <SupportView initial={tickets} agents={team.slice(1, 5).map((m) => m.name)} />
    </Suspense>
  );
}
