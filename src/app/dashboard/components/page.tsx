import type { Metadata } from "next";
import { ComponentsShowcase } from "@/components/showcase/components-showcase";

export const metadata: Metadata = { title: "UI Components" };

export default function ComponentsPage() {
  return <ComponentsShowcase />;
}
