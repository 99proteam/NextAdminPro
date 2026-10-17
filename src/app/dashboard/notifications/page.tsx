import type { Metadata } from "next";
import { notifications } from "@/lib/data";
import { NotificationsView } from "@/components/admin/notifications-view";

export const metadata: Metadata = { title: "Notifications" };

export default function NotificationsPage() {
  return <NotificationsView initial={notifications} />;
}
