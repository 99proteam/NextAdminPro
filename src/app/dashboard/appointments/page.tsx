import type { Metadata } from "next";
import { AppointmentsModule } from "@/components/modules/appointments";

export const metadata: Metadata = { title: "Appointments" };

export default function Page() {
  return <AppointmentsModule />;
}
