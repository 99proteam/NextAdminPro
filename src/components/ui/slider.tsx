"use client";

import * as React from "react";
import { Slider as S } from "radix-ui";
import { cn } from "@/lib/utils";

export function Slider({ className, ...props }: React.ComponentProps<typeof S.Root>) {
  const thumbs = (props.value ?? props.defaultValue ?? [0]).length;
  return (
    <S.Root className={cn("relative flex h-5 w-full touch-none select-none items-center", className)} {...props}>
      <S.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted">
        <S.Range className="absolute h-full bg-primary" />
      </S.Track>
      {Array.from({ length: thumbs }, (_, i) => (
        <S.Thumb
          key={i}
          className="block size-4 cursor-grab rounded-full border-2 border-primary bg-card shadow-sm transition-shadow focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/30 active:cursor-grabbing"
        />
      ))}
    </S.Root>
  );
}
