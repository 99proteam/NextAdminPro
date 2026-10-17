import type { Metadata } from "next";
import { SubscriptionsModule } from "@/components/modules/subscriptions";

export const metadata: Metadata = { title: "Subscriptions" };

export default function Page() {
  return <SubscriptionsModule />;
}
