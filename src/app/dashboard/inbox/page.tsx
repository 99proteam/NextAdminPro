import type { Metadata } from "next";
import { messages } from "@/lib/data";
import { InboxView } from "@/components/inbox/inbox-view";

export const metadata: Metadata = { title: "Inbox" };

export default function InboxPage() {
  return <InboxView initial={messages} />;
}
