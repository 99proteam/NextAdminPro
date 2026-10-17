"use client";

import * as React from "react";
import { useLocalStorage } from "@/lib/use-local-storage";
import { CommandMenuProvider } from "./command-menu";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useLocalStorage("nap-sidebar-collapsed", false);
  return (
    <CommandMenuProvider>
      <div className="flex min-h-svh w-full">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          <main id="main" className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1440px]">{children}</div>
          </main>
        </div>
      </div>
    </CommandMenuProvider>
  );
}
