import type { Metadata } from "next";
import { IntegrationsModule } from "@/components/modules/integrations";

export const metadata: Metadata = { title: "Integrations" };

export default function Page() {
  return <IntegrationsModule />;
}
