import type { Metadata } from "next";
import { KnowledgeBaseModule } from "@/components/modules/knowledge-base";

export const metadata: Metadata = { title: "Knowledge base" };

export default function Page() {
  return <KnowledgeBaseModule />;
}
