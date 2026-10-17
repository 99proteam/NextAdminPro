"use client";

import * as React from "react";
import { FileUp, X } from "lucide-react";
import { cn } from "@/lib/utils";

const size = (n: number) => (n < 1024 ? `${n} B` : n < 1024 ** 2 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1024 ** 2).toFixed(1)} MB`);

export function Dropzone({ accept, multiple = true, hint = "PNG, JPG, PDF up to 10 MB", className }: { accept?: string; multiple?: boolean; hint?: string; className?: string }) {
  const [files, setFiles] = React.useState<File[]>([]);
  const [over, setOver] = React.useState(false);
  const input = React.useRef<HTMLInputElement>(null);
  const add = (list: FileList | null) => list && setFiles((f) => (multiple ? [...f, ...Array.from(list)] : Array.from(list).slice(0, 1)));

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          add(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors hover:border-primary/50 hover:bg-muted/40",
          over && "border-primary bg-primary/5",
        )}
      >
        <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary"><FileUp className="size-5" /></span>
        <span className="text-sm"><span className="font-medium text-primary">Click to upload</span> or drag and drop</span>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </button>
      <input ref={input} type="file" hidden accept={accept} multiple={multiple} onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
      {files.length > 0 && (
        <ul className="flex flex-col gap-2">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="flex items-center gap-3 rounded-lg border px-3 py-2 text-sm">
              <FileUp className="size-4 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate">{f.name}</span>
              <span className="text-xs text-muted-foreground tabular">{size(f.size)}</span>
              <button type="button" aria-label={`Remove ${f.name}`} className="cursor-pointer rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground" onClick={() => setFiles((l) => l.filter((_, k) => k !== i))}>
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
