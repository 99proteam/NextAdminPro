"use client";

import { useTheme } from "next-themes";
import { Laptop, Moon, Palette, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { accents, useAccent, type Accent } from "@/components/providers";

export const accentSwatch: Record<Accent, string> = {
  blue: "#2a78d6",
  violet: "#6250d6",
  green: "#0a7d3e",
  orange: "#d4561f",
  rose: "#c8305f",
  slate: "#27272a",
};

export function ThemeMenu() {
  const { theme, setTheme } = useTheme();
  const { accent, setAccent } = useAccent();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Theme">
          <Sun className="dark:hidden" />
          <Moon className="hidden dark:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-52">
        <DropdownMenuLabel>Mode</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          <DropdownMenuRadioItem value="light"><Sun /> Light</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark"><Moon /> Dark</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system"><Laptop /> System</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="flex items-center gap-1.5"><Palette className="size-3.5" /> Accent color</DropdownMenuLabel>
        <div className="grid grid-cols-6 gap-1.5 px-2 pb-2 pt-1">
          {accents.map((a) => (
            <DropdownMenuItem
              key={a}
              onSelect={(e) => {
                e.preventDefault();
                setAccent(a);
              }}
              aria-label={a}
              className="justify-center p-0 data-[highlighted]:bg-transparent"
            >
              <span
                className="size-6 rounded-full ring-offset-2 ring-offset-popover data-[on=true]:ring-2 data-[on=true]:ring-foreground"
                data-on={accent === a}
                style={{ background: accentSwatch[a] }}
              />
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
