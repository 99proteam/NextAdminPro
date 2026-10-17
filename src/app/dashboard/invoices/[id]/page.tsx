import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getInvoice, invoices } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { InvoiceActions } from "@/components/invoices/print-button";
import { LogoMark } from "@/components/layout/logo";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function generateStaticParams() {
  return invoices.map((i) => ({ id: i.id }));
}

export async function generateMetadata({ params }: PageProps<"/dashboard/invoices/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: getInvoice(id)?.number ?? "Invoice" };
}

export default async function InvoicePage({ params }: PageProps<"/dashboard/invoices/[id]">) {
  const { id } = await params;
  const inv = getInvoice(id);
  if (!inv) notFound();
  const subtotal = inv.items.reduce((a, it) => a + it.price * it.quantity, 0);
  const tax = Math.round(subtotal * 0.08 * 100) / 100;

  return (
    <>
      <div className="no-print mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button asChild variant="ghost" size="sm" className="-ml-2 self-start">
          <Link href="/dashboard/invoices"><ArrowLeft /> Invoices</Link>
        </Button>
        <InvoiceActions email={inv.customerEmail} />
      </div>

      <Card className="mx-auto max-w-3xl p-6 sm:p-10 print:border-0 print:shadow-none">
        <div className="flex flex-col justify-between gap-6 sm:flex-row">
          <div>
            <div className="flex items-center gap-2 text-lg font-semibold">
              <LogoMark /> NextAdminPro Inc.
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              500 Market Street, Suite 200<br />San Francisco, CA 94105<br />billing@nextadminpro.dev
            </p>
          </div>
          <div className="sm:text-right">
            <h1 className="text-2xl font-semibold tracking-tight">Invoice</h1>
            <p className="mt-1 font-mono text-sm text-muted-foreground">{inv.number}</p>
            <div className="mt-3"><StatusBadge status={inv.status} /></div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 text-sm sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Billed to</p>
            <p className="mt-2 font-medium">{inv.customerName}</p>
            <p className="text-muted-foreground">{inv.company}<br />{inv.customerEmail}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Issued</p>
            <p className="mt-2">{formatDate(inv.issuedAt, { dateStyle: "long" })}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Due</p>
            <p className="mt-2">{formatDate(inv.dueAt, { dateStyle: "long" })}</p>
          </div>
        </div>

        <table className="mt-10 w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="py-2 font-medium">Description</th>
              <th className="py-2 text-right font-medium">Qty</th>
              <th className="py-2 text-right font-medium">Price</th>
              <th className="py-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {inv.items.map((it) => (
              <tr key={it.productId} className="border-b">
                <td className="py-3">{it.name}</td>
                <td className="py-3 text-right tabular">{it.quantity}</td>
                <td className="py-3 text-right tabular">{formatCurrency(it.price)}</td>
                <td className="py-3 text-right font-medium tabular">{formatCurrency(it.price * it.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="ml-auto mt-6 flex max-w-xs flex-col gap-2 text-sm">
          <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="tabular">{formatCurrency(subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Tax (8%)</dt><dd className="tabular">{formatCurrency(tax)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd className="tabular">{formatCurrency(Math.max(0, inv.amount - subtotal - tax))}</dd></div>
          <div className="flex justify-between border-t pt-2 text-base font-semibold"><dt>Amount due</dt><dd className="tabular">{formatCurrency(inv.status === "paid" ? 0 : inv.amount)}</dd></div>
        </dl>

        <div className="mt-12 border-t pt-6 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Payment terms</p>
          <p className="mt-1">Payment is due within 14 days. Please include the invoice number with your payment. Thank you for your business!</p>
        </div>
      </Card>
    </>
  );
}
