import type { Metadata } from "next";
import { AdvancedShowcase } from "@/components/showcase/advanced-showcase";
import { ComponentsShowcase } from "@/components/showcase/components-showcase";

export const metadata: Metadata = { title: "UI Components" };

export default function ComponentsPage() {
  return (
    <>
      <ComponentsShowcase />
      <AdvancedShowcase />
    </>
  );
}
