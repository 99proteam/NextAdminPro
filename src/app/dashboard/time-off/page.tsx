import type { Metadata } from "next";
import { TimeOffModule } from "@/components/modules/time-off";

export const metadata: Metadata = { title: "Time off" };

export default function Page() {
  return <TimeOffModule />;
}
