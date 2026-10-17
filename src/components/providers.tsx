"use client";

import * as React from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export const accents = ["blue", "violet", "green", "orange", "rose", "slate"] as const;
export type Accent = (typeof accents)[number];

const AccentContext = React.createContext<{ accent: Accent; setAccent: (a: Accent) => void }>({
  accent: "blue",
  setAccent: () => {},
});

export const useAccent = () => React.useContext(AccentContext);

/** Inline script that applies the saved accent before first paint (avoids a color flash). */
export const accentScript = `try{var a=localStorage.getItem("nap-accent");if(a&&a!=="blue")document.documentElement.dataset.accent=a}catch(e){}`;

const accentListeners = new Set<() => void>();
const subscribeAccent = (cb: () => void) => {
  accentListeners.add(cb);
  return () => accentListeners.delete(cb);
};
const readAccent = () => (document.documentElement.dataset.accent as Accent) || "blue";

function AccentProvider({ children }: { children: React.ReactNode }) {
  const accent = React.useSyncExternalStore(subscribeAccent, readAccent, () => "blue" as Accent);

  const setAccent = React.useCallback((a: Accent) => {
    if (a === "blue") delete document.documentElement.dataset.accent;
    else document.documentElement.dataset.accent = a;
    try {
      localStorage.setItem("nap-accent", a);
    } catch {}
    accentListeners.forEach((l) => l());
  }, []);

  const value = React.useMemo(() => ({ accent, setAccent }), [accent, setAccent]);
  return <AccentContext.Provider value={value}>{children}</AccentContext.Provider>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AccentProvider>
        <TooltipProvider delayDuration={200}>
          {children}
          <Toaster richColors closeButton position="bottom-right" />
        </TooltipProvider>
      </AccentProvider>
    </ThemeProvider>
  );
}
