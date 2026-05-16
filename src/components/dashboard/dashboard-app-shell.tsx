"use client";

import { Menu, PanelLeft, Plus, Search, SquarePlus, Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

import { CollectionCreateDialog } from "@/components/collections/collection-create-dialog";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardSidebarDrawer } from "@/components/dashboard/dashboard-sidebar-drawer";
import { DashboardSidebarToggle } from "@/components/dashboard/dashboard-sidebar-toggle";
import { EditorPreferencesProvider } from "@/components/editor/editor-preferences-context";
import { ItemCreateDialog } from "@/components/items/item-create-dialog";
import { ItemDetailDrawer } from "@/components/items/item-detail-drawer";
import { useItemDrawer } from "@/components/items/use-item-drawer";
import { GlobalSearchPalette } from "@/components/search/global-search-palette";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type DashboardSidebarData } from "@/lib/db/sidebar";
import { type GlobalSearchData } from "@/lib/search/global-search";
import { cn } from "@/lib/utils";

interface DashboardAppShellProps {
  children: ReactNode;
  dashboardSidebarData: DashboardSidebarData;
  searchData: GlobalSearchData;
}

export function DashboardAppShell({
  children,
  dashboardSidebarData,
  searchData,
}: DashboardAppShellProps) {
  const itemDrawer = useItemDrawer();
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setSearchOpen((current) => !current);
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <EditorPreferencesProvider initialPreferences={dashboardSidebarData.user?.editorPreferences}>
      <div className="h-screen overflow-hidden bg-[#050507] text-foreground">
      <GlobalSearchPalette
        data={searchData}
        onItemSelect={itemDrawer.openItem}
        onOpenChange={setSearchOpen}
        open={searchOpen}
      />
      <ItemDetailDrawer
        collectionOptions={dashboardSidebarData.collectionOptions}
        error={itemDrawer.error}
        item={itemDrawer.item}
        loading={itemDrawer.loading}
        onItemDeleted={() => itemDrawer.onOpenChange(false)}
        onItemUpdated={itemDrawer.replaceItem}
        onOpenChange={itemDrawer.onOpenChange}
        onRetry={itemDrawer.retry}
        open={itemDrawer.open}
      />

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
                  className="h-12 cursor-pointer rounded-2xl border-border/80 bg-[#111216] pl-11 pr-16 text-[1.05rem] text-slate-200 placeholder:text-slate-500"
                  onClick={() => setSearchOpen(true)}
                  onFocus={() => setSearchOpen(true)}
                  placeholder="Search items, collections..."
                  readOnly
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-lg border border-border/80 bg-[#1a1b20] px-2 py-1 text-xs font-medium text-slate-400">
                  ⌘ K
                </span>
              </div>

              <Link
                aria-label="Open favorites"
                className={cn(
                  buttonVariants({ size: "icon", variant: "outline" }),
                  "ml-auto shrink-0 rounded-2xl border-border/80 bg-transparent text-slate-100 hover:bg-white/[0.04]"
                )}
                href="/favorites"
                prefetch={false}
              >
                <Star className="size-4" />
              </Link>

              <div className="hidden items-center gap-3 md:flex">
                <CollectionCreateDialog>
                  <Button
                    className="rounded-2xl border-border/80 bg-transparent text-slate-100 hover:bg-white/[0.04]"
                    type="button"
                    variant="outline"
                  >
                    <SquarePlus className="size-4" />
                    New Collection
                  </Button>
                </CollectionCreateDialog>

                <ItemCreateDialog collectionOptions={dashboardSidebarData.collectionOptions}>
                  <Button className="rounded-2xl bg-white px-5 text-slate-900 hover:bg-slate-200">
                    <Plus className="size-4" />
                    New Item
                  </Button>
                </ItemCreateDialog>
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1 overflow-y-auto bg-[#050507] px-8 py-10 lg:px-9">
            {children}
          </main>
        </div>
      </div>
      </div>
    </EditorPreferencesProvider>
  );
}
