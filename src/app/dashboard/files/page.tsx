import type { Metadata } from "next";
import { files } from "@/lib/data";
import { FileManager } from "@/components/files/file-manager";

export const metadata: Metadata = { title: "Files" };

export default function FilesPage() {
  return <FileManager initial={files} />;
}
