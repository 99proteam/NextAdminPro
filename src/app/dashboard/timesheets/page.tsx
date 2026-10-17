import type { Metadata } from "next";
import { TimesheetsModule } from "@/components/modules/timesheets";

export const metadata: Metadata = { title: "Timesheets" };

export default function Page() {
  return <TimesheetsModule />;
}
