"use client";

import { Download, Printer, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function InvoiceActions({ email }: { email: string }) {
  return (
    <div className="no-print flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={() => toast.success("Invoice sent", { description: email })}><Send /> Send</Button>
      <Button variant="outline" size="sm" onClick={() => window.print()}><Download /> Save as PDF</Button>
      <Button size="sm" onClick={() => window.print()}><Printer /> Print</Button>
    </div>
  );
}
