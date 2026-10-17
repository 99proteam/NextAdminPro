import type { Metadata } from "next";
import { team } from "@/lib/data";
import { RolesView } from "@/components/roles/roles-view";

export const metadata: Metadata = { title: "Roles & Permissions" };

export default function RolesPage() {
  return <RolesView initialTeam={team} />;
}
