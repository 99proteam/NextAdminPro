"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border bg-card px-6 py-20 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive"><AlertTriangle className="size-6" /></span>
      <div>
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">{error.message || "An unexpected error occurred while loading this page."}</p>
        {error.digest && <p className="mt-2 font-mono text-xs text-muted-foreground">Error ID: {error.digest}</p>}
      </div>
      <Button onClick={reset}><RotateCcw /> Try again</Button>
    </div>
  );
}
