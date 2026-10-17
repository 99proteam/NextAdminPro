import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, CreditCard, MapPin, Package, Truck } from "lucide-react";
import { getCustomer, getOrder, orders } from "@/lib/data";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { OrderActions } from "@/components/orders/order-actions";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function generateStaticParams() {
  return orders.map((o) => ({ id: o.id }));
}

export async function generateMetadata({ params }: PageProps<"/dashboard/orders/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: `Order ${getOrder(id)?.number ?? ""}` };
}

const steps = [
  { key: "pending", label: "Order placed", icon: Check },
  { key: "processing", label: "Processing", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Check },
];

export default async function OrderPage({ params }: PageProps<"/dashboard/orders/[id]">) {
  const { id } = await params;
  const order = getOrder(id);
  if (!order) notFound();
  const customer = getCustomer(order.customerId);
  const reached = steps.findIndex((s) => s.key === order.status);
  const progress = order.status === "cancelled" || order.status === "refunded" ? 0 : reached;

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="no-print -ml-2 mb-4">
        <Link href="/dashboard/orders"><ArrowLeft /> Orders</Link>
      </Button>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Order {order.number}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Placed {formatDate(order.createdAt, { dateStyle: "long", timeStyle: "short" })}</p>
        </div>
        <OrderActions status={order.status} total={formatCurrency(order.total)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Fulfilment</CardTitle></CardHeader>
            <CardContent>
              <ol className="grid grid-cols-4 gap-2">
                {steps.map((s, i) => {
                  const done = i <= progress;
                  return (
                    <li key={s.key} className="flex flex-col items-center gap-2 text-center">
                      <div className="flex w-full items-center">
                        <span className={cn("h-0.5 flex-1", i === 0 ? "bg-transparent" : i <= progress ? "bg-primary" : "bg-border")} />
                        <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full border-2", done ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground")}>
                          <s.icon className="size-4" />
                        </span>
                        <span className={cn("h-0.5 flex-1", i === steps.length - 1 ? "bg-transparent" : i < progress ? "bg-primary" : "bg-border")} />
                      </div>
                      <span className={cn("text-xs", done ? "font-medium" : "text-muted-foreground")}>{s.label}</span>
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Items</CardTitle></CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-5">Product</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="pr-5 text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((it) => (
                    <TableRow key={it.productId}>
                      <TableCell className="pl-5 font-medium">{it.name}</TableCell>
                      <TableCell className="text-right tabular">{formatCurrency(it.price)}</TableCell>
                      <TableCell className="text-right tabular">{it.quantity}</TableCell>
                      <TableCell className="pr-5 text-right font-medium tabular">{formatCurrency(it.price * it.quantity)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <dl className="ml-auto mt-2 flex max-w-xs flex-col gap-2 px-5 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="tabular">{formatCurrency(order.subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Tax (8%)</dt><dd className="tabular">{formatCurrency(order.tax)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd className="tabular">{order.shipping ? formatCurrency(order.shipping) : "Free"}</dd></div>
                <div className="flex justify-between border-t pt-2 text-base font-semibold"><dt>Total</dt><dd className="tabular">{formatCurrency(order.total)}</dd></div>
              </dl>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
            <CardContent>
              <Link href={`/dashboard/customers/${order.customerId}`} className="flex items-center gap-3 rounded-lg hover:opacity-80">
                <Avatar name={order.customerName} className="size-10" />
                <div className="min-w-0">
                  <p className="font-medium">{order.customerName}</p>
                  <p className="truncate text-sm text-muted-foreground">{order.customerEmail}</p>
                </div>
              </Link>
              {customer && <p className="mt-3 text-sm text-muted-foreground">{customer.orders} orders · {formatCurrency(customer.totalSpent)} lifetime</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Shipping address</CardTitle></CardHeader>
            <CardContent className="flex gap-3 text-sm">
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <p>{order.customerName}<br />{order.shippingAddress}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Payment</CardTitle></CardHeader>
            <CardContent className="flex items-center gap-3 text-sm">
              <CreditCard className="size-4 text-muted-foreground" />
              <span>{order.payment}</span>
              <span className="ml-auto font-medium tabular">{formatCurrency(order.total)}</span>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
