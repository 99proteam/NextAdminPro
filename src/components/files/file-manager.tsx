"use client";

import * as React from "react";
import {
  ChevronRight,
  Clock,
  Download,
  File,
  FileArchive,
  FileCode2,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Folder,
  FolderPlus,
  HardDrive,
  Image as ImageIcon,
  LayoutGrid,
  List,
  MoreVertical,
  Pencil,
  Search,
  Share2,
  Star,
  Trash2,
  Upload,
  Users,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import type { FileItem } from "@/lib/data";
import { formatRelative } from "@/lib/time";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

const kindMeta: Record<FileItem["kind"], { icon: LucideIcon; tone: string; label: string }> = {
  folder: { icon: Folder, tone: "text-chart-4 bg-chart-4/12", label: "Folders" },
  image: { icon: ImageIcon, tone: "text-chart-5 bg-chart-5/12", label: "Images" },
  pdf: { icon: FileText, tone: "text-destructive bg-destructive/10", label: "PDFs" },
  doc: { icon: FileText, tone: "text-chart-1 bg-chart-1/12", label: "Documents" },
  sheet: { icon: FileSpreadsheet, tone: "text-chart-3 bg-chart-3/12", label: "Spreadsheets" },
  video: { icon: FileVideo, tone: "text-chart-2 bg-chart-2/12", label: "Videos" },
  zip: { icon: FileArchive, tone: "text-muted-foreground bg-muted", label: "Archives" },
  code: { icon: FileCode2, tone: "text-chart-6 bg-chart-6/12", label: "Code" },
};

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let v = n / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v < 10 ? 1 : 0)} ${units[i]}`;
}

function kindFromName(name: string): FileItem["kind"] {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["png", "jpg", "jpeg", "gif", "svg", "webp", "avif"].includes(ext)) return "image";
  if (ext === "pdf") return "pdf";
  if (["doc", "docx", "txt", "md", "rtf"].includes(ext)) return "doc";
  if (["csv", "xls", "xlsx"].includes(ext)) return "sheet";
  if (["mp4", "mov", "webm", "avi"].includes(ext)) return "video";
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "zip";
  if (["ts", "tsx", "js", "json", "py", "go", "css", "html"].includes(ext)) return "code";
  return "doc";
}

const QUOTA = 50 * 1024 ** 3;
type View = "all" | "recent" | "starred" | "shared";

export function FileManager({ initial }: { initial: FileItem[] }) {
  const [items, setItems] = React.useState(initial);
  const [folder, setFolder] = React.useState("root");
  const [view, setView] = React.useState<View>("all");
  const [layout, setLayout] = React.useState<"grid" | "list">("grid");
  const [query, setQuery] = React.useState("");
  const [dragging, setDragging] = React.useState(false);
  const [renaming, setRenaming] = React.useState<FileItem | null>(null);
  const [newFolder, setNewFolder] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const used = items.filter((i) => i.folder === "root").reduce((a, i) => a + i.size, 0);
  const byKind = Object.entries(
    items.filter((i) => i.kind !== "folder").reduce<Record<string, number>>((acc, i) => ((acc[i.kind] = (acc[i.kind] ?? 0) + i.size), acc), {}),
  ).sort((a, b) => b[1] - a[1]);

  const current = items.find((i) => i.id === folder);
  const shown = items
    .filter((i) => {
      if (query) return i.name.toLowerCase().includes(query.toLowerCase());
      if (view === "starred") return i.starred;
      if (view === "shared") return i.shared;
      if (view === "recent") return i.kind !== "folder";
      return i.folder === folder;
    })
    .sort((a, b) =>
      view === "recent"
        ? b.modifiedAt.localeCompare(a.modifiedAt)
        : Number(b.kind === "folder") - Number(a.kind === "folder") || a.name.localeCompare(b.name),
    );

  const patch = (id: string, p: Partial<FileItem>) => setItems((l) => l.map((i) => (i.id === id ? { ...i, ...p } : i)));

  const addFiles = (list: FileList | null) => {
    if (!list?.length) return;
    const added: FileItem[] = Array.from(list).map((f, idx) => ({
      id: `up_${Date.now()}_${idx}`,
      name: f.name,
      kind: kindFromName(f.name),
      size: f.size,
      folder: view === "all" ? folder : "root",
      owner: "Alex Morgan",
      modifiedAt: new Date().toISOString(),
      starred: false,
      shared: false,
    }));
    setItems((l) => [...added, ...l]);
    toast.success(`Uploaded ${added.length} file${added.length > 1 ? "s" : ""}`, { description: "Connect S3, R2 or Vercel Blob to store uploads." });
  };

  const open = (i: FileItem) => {
    if (i.kind === "folder") {
      setFolder(i.id);
      setView("all");
      setQuery("");
    } else toast.info(`Preview for ${i.name}`, { description: "Hook this up to your storage provider to open files." });
  };

  const menu = (i: FileItem) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${i.name}`} onClick={(e) => e.stopPropagation()}><MoreVertical /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
        {i.kind !== "folder" && <DropdownMenuItem onSelect={() => toast.success(`Downloading ${i.name}`)}><Download /> Download</DropdownMenuItem>}
        <DropdownMenuItem onSelect={() => { patch(i.id, { shared: !i.shared }); toast.success(i.shared ? "Sharing disabled" : "Share link copied"); }}><Share2 /> {i.shared ? "Stop sharing" : "Share"}</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => patch(i.id, { starred: !i.starred })}><Star /> {i.starred ? "Unstar" : "Star"}</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setRenaming(i)}><Pencil /> Rename</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive onSelect={() => { setItems((l) => l.filter((x) => x.id !== i.id && x.folder !== i.id)); toast.success(`Moved ${i.name} to trash`); }}><Trash2 /> Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const nav: { id: View; label: string; icon: LucideIcon }[] = [
    { id: "all", label: "My files", icon: HardDrive },
    { id: "recent", label: "Recent", icon: Clock },
    { id: "starred", label: "Starred", icon: Star },
    { id: "shared", label: "Shared", icon: Users },
  ];

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Files</h1>
          <p className="mt-1 text-sm text-muted-foreground">Store, organise and share documents with your team.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setNewFolder(true)}><FolderPlus /> New folder</Button>
          <Button onClick={() => inputRef.current?.click()}><Upload /> Upload</Button>
          <input ref={inputRef} type="file" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <div className="flex flex-col gap-4">
          <Card className="p-2">
            {nav.map((n) => (
              <button
                key={n.id}
                onClick={() => { setView(n.id); setFolder("root"); setQuery(""); }}
                className={cn("flex h-9 w-full cursor-pointer items-center gap-3 rounded-md px-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground", view === n.id && "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary")}
              >
                <n.icon className="size-4" /> {n.label}
              </button>
            ))}
          </Card>
          <Card className="p-4">
            <p className="text-sm font-semibold">Storage</p>
            <p className="mt-1 text-xs text-muted-foreground"><span className="font-medium text-foreground">{formatBytes(used)}</span> of {formatBytes(QUOTA)} used</p>
            <Progress value={(used / QUOTA) * 100} className="mt-3" />
            <ul className="mt-4 flex flex-col gap-2.5">
              {byKind.slice(0, 5).map(([k, size]) => {
                const meta = kindMeta[k as FileItem["kind"]];
                return (
                  <li key={k} className="flex items-center gap-2 text-xs">
                    <span className={cn("flex size-6 items-center justify-center rounded-md", meta.tone)}><meta.icon className="size-3.5" /></span>
                    <span>{meta.label}</span>
                    <span className="ml-auto tabular text-muted-foreground">{formatBytes(size)}</span>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>

        <Card
          className={cn("relative min-h-[480px] p-4 transition-colors", dragging && "border-primary bg-primary/5")}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false); }}
          onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        >
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <nav className="flex min-w-0 items-center gap-1 text-sm" aria-label="Folder path">
              <button className="cursor-pointer font-medium text-muted-foreground hover:text-foreground" onClick={() => { setFolder("root"); setView("all"); }}>
                {nav.find((n) => n.id === view)?.label}
              </button>
              {current && view === "all" && (
                <>
                  <ChevronRight className="size-4 text-muted-foreground" />
                  <span className="truncate font-medium">{current.name}</span>
                </>
              )}
            </nav>
            <div className="flex gap-2 sm:ml-auto">
              <div className="relative flex-1 sm:w-60">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search files" className="pl-9" aria-label="Search files" />
              </div>
              <div className="flex rounded-md border bg-card p-0.5">
                <Button variant="ghost" size="icon-sm" className={cn("h-7", layout === "grid" && "bg-muted")} onClick={() => setLayout("grid")} aria-label="Grid view" aria-pressed={layout === "grid"}><LayoutGrid /></Button>
                <Button variant="ghost" size="icon-sm" className={cn("h-7", layout === "list" && "bg-muted")} onClick={() => setLayout("list")} aria-label="List view" aria-pressed={layout === "list"}><List /></Button>
              </div>
            </div>
          </div>

          {shown.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-20 text-center text-sm text-muted-foreground">
              <Upload className="size-8" />
              <p>Drop files here or <button className="cursor-pointer font-medium text-primary hover:underline" onClick={() => inputRef.current?.click()}>browse</button></p>
            </div>
          ) : layout === "grid" ? (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {shown.map((i) => {
                const meta = kindMeta[i.kind];
                return (
                  <li key={i.id}>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => open(i)}
                      onKeyDown={(e) => e.key === "Enter" && open(i)}
                      className="group flex cursor-pointer flex-col gap-3 rounded-xl border bg-card p-3 transition-colors hover:border-primary/40 hover:bg-muted/40"
                    >
                      <div className="flex items-start justify-between">
                        <span className={cn("flex size-11 items-center justify-center rounded-lg", meta.tone)}><meta.icon className="size-5" /></span>
                        <div className="flex items-center">
                          {i.starred && <Star className="size-3.5 fill-chart-4 text-chart-4" />}
                          {menu(i)}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium" title={i.name}>{i.name}</p>
                        <p className="text-xs text-muted-foreground">{i.kind === "folder" ? `${i.items} items` : formatBytes(i.size)} · {formatRelative(i.modifiedAt)}</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <ul className="divide-y rounded-xl border">
              {shown.map((i) => {
                const meta = kindMeta[i.kind];
                return (
                  <li key={i.id} role="button" tabIndex={0} onClick={() => open(i)} onKeyDown={(e) => e.key === "Enter" && open(i)} className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-muted/40">
                    <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-md", meta.tone)}><meta.icon className="size-4" /></span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{i.name}</span>
                    {i.shared && <Users className="hidden size-3.5 text-muted-foreground sm:block" aria-label="Shared" />}
                    <span className="hidden w-32 truncate text-xs text-muted-foreground md:block">{i.owner}</span>
                    <span className="hidden w-20 text-right text-xs tabular text-muted-foreground sm:block">{i.kind === "folder" ? `${i.items} items` : formatBytes(i.size)}</span>
                    <span className="w-20 text-right text-xs text-muted-foreground">{formatRelative(i.modifiedAt)}</span>
                    {menu(i)}
                  </li>
                );
              })}
            </ul>
          )}
          {dragging && (
            <div className="pointer-events-none absolute inset-2 flex items-center justify-center rounded-xl border-2 border-dashed border-primary bg-primary/5 text-sm font-medium text-primary">
              <File className="mr-2 size-4" /> Drop to upload
            </div>
          )}
        </Card>
      </div>

      <Dialog open={!!renaming || newFolder} onOpenChange={(o) => { if (!o) { setRenaming(null); setNewFolder(false); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{renaming ? "Rename" : "New folder"}</DialogTitle>
            <DialogDescription className="sr-only">Enter a name</DialogDescription>
          </DialogHeader>
          <form
            key={renaming?.id ?? "new"}
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              const name = String(new FormData(e.currentTarget).get("name") ?? "").trim();
              if (!name) return;
              if (renaming) patch(renaming.id, { name });
              else setItems((l) => [{ id: `fld_${Date.now()}`, name, kind: "folder", size: 0, items: 0, folder: view === "all" ? folder : "root", owner: "Alex Morgan", modifiedAt: new Date().toISOString(), starred: false, shared: false }, ...l]);
              toast.success(renaming ? "Renamed" : `Folder “${name}” created`);
              setRenaming(null);
              setNewFolder(false);
            }}
          >
            <Input name="name" defaultValue={renaming?.name ?? "Untitled folder"} autoFocus aria-label="Name" onFocus={(e) => e.currentTarget.select()} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setRenaming(null); setNewFolder(false); }}>Cancel</Button>
              <Button type="submit">{renaming ? "Rename" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
