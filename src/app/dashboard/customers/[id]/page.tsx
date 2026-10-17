import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, CalendarDays, Mail, MapPin, Phone } from "lucide-react";
import { customers, getCustomer, ordersForCustomer } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { formatRelative } from "@/lib/time";
import { StatusBadge } from "@/components/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function generateStaticParams() {
  return customers.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: PageProps<"/dashboard/customers/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: getCustomer(id)?.name ?? "Customer" };
}

export default async function CustomerPage({ params }: PageProps<"/dashboard/customers/[id]">) {
  const { id } = await params;
  const customer = getCustomer(id);
  if (!customer) notFound();
  const orders = ordersForCustomer(id);
  const avg = orders.length ? customer.totalSpent / orders.length : 0;

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-4">
        <Link href="/dashboard/customers"><ArrowLeft /> Customers</Link>
      </Button>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:row-span-2">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <Avatar name={customer.name} className="size-20 text-xl" />
            <h1 className="mt-4 text-xl font-semibold">{customer.name}</h1>
            <p className="text-sm text-muted-foreground">{customer.company}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <StatusBadge status={customer.status} />
              <Badge variant="outline">{customer.plan}</Badge>
              {customer.tags.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
            </div>
            <ul className="mt-6 flex w-full flex-col gap-3 border-t pt-6 text-left text-sm">
              <li className="flex items-center gap-3"><Mail className="size-4 text-muted-foreground" /> {customer.email}</li>
              <li className="flex items-center gap-3"><Phone className="size-4 text-muted-foreground" /> {customer.phone}</li>
              <li className="flex items-center gap-3"><Building2 className="size-4 text-muted-foreground" /> {customer.company}</li>
              <li className="flex items-center gap-3"><MapPin className="size-4 text-muted-foreground" /> {customer.city}, {customer.country}</li>
              <li className="flex items-center gap-3"><CalendarDays className="size-4 text-muted-foreground" /> Joined {formatDate(customer.joinedAt)}</li>
            </ul>
            <div className="mt-6 grid w-full grid-cols-2 gap-2">
              <Button asChild variant="outline"><a href={`mailto:${customer.email}`}><Mail /> Email</a></Button>
              <Button asChild><Link href="/dashboard/invoices">Create invoice</Link></Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
          {[
            ["Lifetime value", formatCurrency(customer.totalSpent)],
            ["Orders", String(customer.orders)],
            ["Avg. order", formatCurrency(avg)],
          ].map(([label, value]) => (
            <Card key={label} className="p-5">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight tabular">{value}</p>
            </Card>
          ))}
        </div>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Order history</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            {orders.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-5">Order</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-5 text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="pl-5 font-medium">
                        <Link href={`/dashboard/orders/${o.id}`} className="hover:text-primary hover:underline">{o.number}</Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatRelative(o.createdAt)}</TableCell>
                      <TableCell><StatusBadge status={o.status} /></TableCell>
                      <TableCell className="pr-5 text-right font-medium tabular">{formatCurrency(o.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
