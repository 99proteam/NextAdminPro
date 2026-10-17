import type { Metadata } from "next";
import { CampaignsModule } from "@/components/modules/campaigns";

export const metadata: Metadata = { title: "Campaigns" };

export default function Page() {
  return <CampaignsModule />;
}
