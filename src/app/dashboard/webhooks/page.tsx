import type { Metadata } from "next";
import { WebhooksModule } from "@/components/modules/webhooks";

export const metadata: Metadata = { title: "Webhooks" };

export default function Page() {
  return <WebhooksModule />;
}
