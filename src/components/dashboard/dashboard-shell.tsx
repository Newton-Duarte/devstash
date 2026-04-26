"use client";

import { Menu, Plus, Search } from "lucide-react";
import { useState } from "react";

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardSidebarDrawer } from "@/components/dashboard/dashboard-sidebar-drawer";
import { DashboardSidebarToggle } from "@/components/dashboard/dashboard-sidebar-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function DashboardShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardSidebarDrawer
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      >
        <DashboardSidebar mobile />
      </DashboardSidebarDrawer>

      <div className="mx-auto flex min-h-screen w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <aside
          className={cn(
            "hidden rounded-[2rem] border border-border bg-card/75 p-4 shadow-sm backdrop-blur lg:flex lg:flex-col",
            sidebarCollapsed ? "lg:w-[92px]" : "lg:w-[320px]"
          )}
        >
          <div className="mb-5 flex items-center justify-between gap-3 px-2">
            <div className={cn("min-w-0", sidebarCollapsed && "sr-only")}>
              <p className="text-xs font-medium tracking-[0.3em] text-muted-foreground uppercase">
                DevStash
              </p>
              <h1 className="text-sm font-semibold text-foreground">
                Workspace
              </h1>
            </div>

            <DashboardSidebarToggle
              collapsed={sidebarCollapsed}
              onClick={() => setSidebarCollapsed((current) => !current)}
            />
          </div>

          <DashboardSidebar collapsed={sidebarCollapsed} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="mb-6 flex flex-col gap-4 rounded-3xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Button
                aria-label="Open sidebar"
                className="lg:hidden"
                onClick={() => setMobileSidebarOpen(true)}
                size="icon"
                type="button"
                variant="outline"
              >
                <Menu className="size-4" />
              </Button>

              <div className="relative w-full max-w-xl flex-1 sm:min-w-[320px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  aria-label="Search items"
                  className="pl-10"
                  placeholder="Search snippets, prompts, notes, and commands"
                />
              </div>
            </div>

            <Button className="w-full sm:w-auto">
              <Plus className="size-4" />
              New Item
            </Button>
          </header>

          <main className="flex-1 rounded-[2rem] border border-border bg-card/65 p-6 shadow-sm">
            <div className="flex h-full min-h-[520px] flex-col justify-between gap-8 rounded-[1.5rem] border border-dashed border-border/80 bg-background/35 p-6">
              <div>
                <p className="mb-2 text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">
                  Main Panel
                </p>
                <h2 className="text-2xl font-semibold text-foreground">Main</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-3xl border border-border bg-card/80 p-4">
                  <p className="text-sm font-medium text-foreground">
                    Favorites and recents now live in the sidebar.
                  </p>
                </div>
                <div className="rounded-3xl border border-border bg-card/80 p-4">
                  <p className="text-sm font-medium text-foreground">
                    Phase 3 can replace this area with real dashboard content.
                  </p>
                </div>
                <div className="rounded-3xl border border-border bg-card/80 p-4 md:col-span-2 xl:col-span-1">
                  <p className="text-sm font-medium text-foreground">
                    Desktop supports collapse; mobile uses a drawer.
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
