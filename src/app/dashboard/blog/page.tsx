import type { Metadata } from "next";
import { BlogModule } from "@/components/modules/blog";

export const metadata: Metadata = { title: "Blog posts" };

export default function Page() {
  return <BlogModule />;
}
