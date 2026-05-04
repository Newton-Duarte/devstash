"use client";

import { Menu, PanelLeft, Plus, Search, SquarePlus } from "lucide-react";
import { useState } from "react";

import { DashboardCollectionCard } from "@/components/dashboard/dashboard-collection-card";
import { DashboardPinnedItem } from "@/components/dashboard/dashboard-pinned-item";
import { DashboardRecentItem } from "@/components/dashboard/dashboard-recent-item";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardSidebarDrawer } from "@/components/dashboard/dashboard-sidebar-drawer";
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import { DashboardSidebarToggle } from "@/components/dashboard/dashboard-sidebar-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type DashboardCollectionsData } from "@/lib/db/collections";
import { type DashboardItemsData } from "@/lib/db/items";
import { type DashboardSidebarData } from "@/lib/db/sidebar";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  dashboardCollectionsData: DashboardCollectionsData;
  dashboardItemsData: DashboardItemsData;
  dashboardSidebarData: DashboardSidebarData;
}

export function DashboardShell({
  dashboardCollectionsData,
  dashboardItemsData,
  dashboardSidebarData,
}: DashboardShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const stats = [
    {
      label: "Items",
      value: dashboardItemsData.stats.totalItems,
      detail: "Total saved resources",
    },
    {
      label: "Collections",
      value: dashboardCollectionsData.stats.totalCollections,
      detail: "Organized knowledge groups",
    },
    {
      label: "Favorite Items",
      value: dashboardItemsData.stats.favoriteItems,
      detail: "Quick-access starred entries",
    },
    {
      label: "Favorite Collections",
      value: dashboardCollectionsData.stats.favoriteCollections,
      detail: "Pinned collection groups",
    },
  ];

  return (
    <div className="h-screen overflow-hidden bg-[#050507] text-foreground">
      <DashboardSidebarDrawer
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      >
        <DashboardSidebar data={dashboardSidebarData} mobile />
      </DashboardSidebarDrawer>

      <div className="flex h-full border-l border-r border-border/80">
        <aside
          className={cn(
            "hidden h-full shrink-0 border-r border-border/80 bg-[#030304] lg:flex lg:flex-col",
            sidebarCollapsed ? "lg:w-[82px]" : "lg:w-[366px]"
          )}
        >
          <div className="flex h-[84px] items-center justify-between border-b border-border/80 px-4">
            <div
              className={cn(
                "flex items-center gap-4",
                sidebarCollapsed && "justify-center"
              )}
            >
              <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
                <span className="text-sm font-semibold">▤</span>
              </div>
              <span
                className={cn(
                  "text-[1.05rem] font-semibold text-white",
                  sidebarCollapsed && "sr-only"
                )}
              >
                DevStash
              </span>
            </div>

            <DashboardSidebarToggle
              collapsed={sidebarCollapsed}
              onClick={() => setSidebarCollapsed((current) => !current)}
            />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-8">
            <DashboardSidebar collapsed={sidebarCollapsed} data={dashboardSidebarData} />
          </div>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <header className="flex h-[84px] shrink-0 items-center border-b border-border/80 bg-[#07080a]">
            <div className="flex h-full w-[84px] items-center justify-center border-r border-border/80">
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

              <div className="hidden lg:flex">
                <Button
                  aria-label="Collapse sidebar"
                  onClick={() => setSidebarCollapsed((current) => !current)}
                  size="icon"
                  type="button"
                  variant="outline"
                >
                  <PanelLeft className="size-4" />
                </Button>
              </div>
            </div>

            <div className="flex min-w-0 flex-1 items-center gap-4 px-5">
              <div className="relative w-full max-w-[520px]">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  aria-label="Search items"
                  className="h-12 rounded-2xl border-border/80 bg-[#111216] pl-11 pr-16 text-[1.05rem] text-slate-200 placeholder:text-slate-500"
                  placeholder="Search items..."
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-lg border border-border/80 bg-[#1a1b20] px-2 py-1 text-xs font-medium text-slate-400">
                  ⌘ K
                </span>
              </div>

              <div className="ml-auto hidden items-center gap-3 md:flex">
                <Button
                  className="rounded-2xl border-border/80 bg-transparent text-slate-100 hover:bg-white/[0.04]"
                  type="button"
                  variant="outline"
                >
                  <SquarePlus className="size-4" />
                  New Collection
                </Button>

                <Button className="rounded-2xl bg-white px-5 text-slate-900 hover:bg-slate-200">
                  <Plus className="size-4" />
                  New Item
                </Button>
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1 overflow-y-auto bg-[#050507] px-8 py-10 lg:px-9">
            <section className="mb-12">
              <h1 className="text-[3rem] font-semibold tracking-[-0.04em] text-white">
                Dashboard
              </h1>
              <p className="mt-2 text-[1.05rem] text-slate-500">
                Your developer knowledge hub
              </p>
            </section>

            <section className="mb-12">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                  <DashboardStatCard
                    detail={stat.detail}
                    key={stat.label}
                    label={stat.label}
                    value={stat.value}
                  />
                ))}
              </div>
            </section>

            <section className="mb-12">
              <div className="mb-6 flex items-center justify-between gap-4">
                <h2 className="text-[2rem] font-semibold tracking-[-0.03em] text-white">
                  Recent Collections
                </h2>
                <button
                  className="text-[1.05rem] text-slate-400 transition hover:text-white"
                  type="button"
                >
                  View all
                </button>
              </div>

              <div className="grid gap-5 xl:grid-cols-3">
                {dashboardCollectionsData.collections.map((collection) => (
                  <DashboardCollectionCard
                    collection={collection}
                    key={collection.id}
                  />
                ))}
              </div>
            </section>

            {dashboardItemsData.pinnedItems.length > 0 ? (
              <section>
                <div className="mb-6 flex items-center gap-3">
                  <span className="text-muted-foreground">📌</span>
                  <h2 className="text-[1.8rem] font-semibold tracking-[-0.03em] text-white">
                    Pinned Items
                  </h2>
                </div>

                <div className="space-y-4">
                  {dashboardItemsData.pinnedItems.map((item) => (
                    <DashboardPinnedItem item={item} key={item.id} />
                  ))}
                </div>
              </section>
            ) : null}

            <section className={dashboardItemsData.pinnedItems.length > 0 ? "mt-12" : ""}>
              <div className="mb-6 flex items-center justify-between gap-4">
                <h2 className="text-[1.8rem] font-semibold tracking-[-0.03em] text-white">
                  Recent Items
                </h2>
                <p className="text-sm text-slate-500">Latest 10 updates</p>
              </div>

              <div className="space-y-4">
                {dashboardItemsData.recentItems.map((item) => (
                  <DashboardRecentItem item={item} key={item.id} />
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
