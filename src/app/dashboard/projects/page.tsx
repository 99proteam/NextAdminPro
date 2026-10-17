import type { Metadata } from "next";
import { ProjectsModule } from "@/components/modules/projects";

export const metadata: Metadata = { title: "Projects" };

export default function Page() {
  return <ProjectsModule />;
}
