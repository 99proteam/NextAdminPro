import type { Metadata } from "next";
import { coupons } from "@/lib/data";
import { CouponsView } from "@/components/coupons/coupons-view";

export const metadata: Metadata = { title: "Coupons" };

export default function CouponsPage() {
  return <CouponsView initial={coupons} />;
}
