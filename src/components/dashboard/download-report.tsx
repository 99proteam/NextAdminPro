"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";
import { revenueByMonth } from "@/lib/data";
import { downloadCsv } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function DownloadReportButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        downloadCsv("revenue-report.csv", revenueByMonth);
        toast.success("Report downloaded");
      }}
    >
      <Download /> Download report
    </Button>
  );
}
