"use client";

import { DashboardAppShell } from "@/components/dashboard/dashboard-app-shell";
import { DashboardCollectionCard } from "@/components/dashboard/dashboard-collection-card";
import { DashboardPinnedItem } from "@/components/dashboard/dashboard-pinned-item";
import { DashboardRecentItem } from "@/components/dashboard/dashboard-recent-item";
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import { ItemDetailDrawer } from "@/components/items/item-detail-drawer";
import { useItemDrawer } from "@/components/items/use-item-drawer";
import { type DashboardCollectionsData } from "@/lib/db/collections";
import { type DashboardItemsData } from "@/lib/db/items";
import { type DashboardSidebarData } from "@/lib/db/sidebar";

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
  const itemDrawer = useItemDrawer();
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
    <DashboardAppShell dashboardSidebarData={dashboardSidebarData}>
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
              href={`/collections/${collection.id}`}
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
              <DashboardPinnedItem
                item={item}
                key={item.id}
                onOpen={itemDrawer.openItem}
              />
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
            <DashboardRecentItem
              item={item}
              key={item.id}
              onOpen={itemDrawer.openItem}
            />
          ))}
        </div>
      </section>
    </DashboardAppShell>
  );
}
