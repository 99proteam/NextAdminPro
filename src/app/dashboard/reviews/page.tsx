import type { Metadata } from "next";
import { ReviewsModule } from "@/components/modules/reviews";

export const metadata: Metadata = { title: "Reviews" };

export default function Page() {
  return <ReviewsModule />;
}
