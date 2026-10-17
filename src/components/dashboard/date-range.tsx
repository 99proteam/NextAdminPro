"use client";

import * as React from "react";
import { Calendar, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const presets = ["Today", "Last 7 days", "Last 30 days", "Last 90 days", "Month to date", "Year to date"];

export function DateRangePicker({ defaultValue = "Last 30 days" }: { defaultValue?: string }) {
  const [value, setValue] = React.useState(defaultValue);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Calendar /> {value}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        {presets.map((p) => (
          <DropdownMenuItem key={p} onSelect={() => setValue(p)}>
            <span className="flex-1">{p}</span>
            {p === value && <Check className="!text-foreground" strokeWidth={3} />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
