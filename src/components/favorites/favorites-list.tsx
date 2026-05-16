"use client";

import { Folder, Star } from "lucide-react";
import Link from "next/link";

import { DashboardItemTypeIcon } from "@/components/dashboard/dashboard-item-type-icon";
import { ItemDetailDrawer } from "@/components/items/item-detail-drawer";
import { useItemDrawer } from "@/components/items/use-item-drawer";
import { type CollectionOption } from "@/lib/db/collections";
import { type FavoritesPageData, type FavoriteItemRow } from "@/lib/db/favorites";

interface FavoritesListProps {
  collectionOptions: CollectionOption[];
  data: FavoritesPageData;
}

interface SectionHeaderProps {
  count: number;
  title: string;
}

const rowClass =
  "grid w-full grid-cols-[1.75rem_minmax(0,1fr)] items-center gap-x-3 gap-y-1 border-b border-white/[0.06] px-3 py-2.5 text-left font-mono text-sm transition last:border-b-0 hover:bg-white/[0.035] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:grid-cols-[1.75rem_minmax(0,1fr)_8.5rem_7rem]";
const sectionClass =
  "overflow-hidden border border-white/10 bg-[#08090c] shadow-2xl shadow-black/15";

function SectionHeader({ count, title }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 font-mono text-xs tracking-[0.2em] text-slate-500 uppercase">
      <span>{title}</span>
      <span>{count}</span>
    </div>
  );
}

function TypeBadge({ children }: { children: string }) {
  return (
    <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[0.7rem] font-medium tracking-[0.12em] text-slate-400 uppercase">
      {children}
    </span>
  );
}

function FavoriteItemRow({ item, onOpen }: { item: FavoriteItemRow; onOpen: (itemId: string) => void }) {
  return (
    <button className={rowClass} onClick={() => onOpen(item.id)} type="button">
      <span className="flex size-7 items-center justify-center rounded-lg bg-white/[0.04]">
        <DashboardItemTypeIcon className="size-4" type={item.type} />
      </span>
      <span className="min-w-0 truncate text-slate-200">{item.title}</span>
      <span className="text-slate-500 sm:text-right">
        <TypeBadge>{item.type.name}</TypeBadge>
      </span>
      <span className="text-xs text-slate-500 sm:text-right">{item.updatedAtLabel}</span>
    </button>
  );
}

export function FavoritesList({ collectionOptions, data }: FavoritesListProps) {
  const drawer = useItemDrawer();
  const hasFavorites = data.items.length > 0 || data.collections.length > 0;

  if (!hasFavorites) {
    return (
      <div className="border border-dashed border-white/10 bg-[#0a0b0e] px-6 py-14 text-center font-mono">
        <Star className="mx-auto size-8 text-slate-600" />
        <p className="mt-5 text-sm tracking-[0.2em] text-slate-500 uppercase">
          No favorites
        </p>
        <p className="mt-2 text-sm text-slate-400">
          Star items or collections to build a quick-access list here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <section className={sectionClass}>
          <SectionHeader count={data.items.length} title="Items" />
          {data.items.length > 0 ? (
            <div>
              {data.items.map((item) => (
                <FavoriteItemRow item={item} key={item.id} onOpen={drawer.openItem} />
              ))}
            </div>
          ) : (
            <p className="px-3 py-6 font-mono text-sm text-slate-500">No favorited items.</p>
          )}
        </section>

        <section className={sectionClass}>
          <SectionHeader count={data.collections.length} title="Collections" />
          {data.collections.length > 0 ? (
            <div>
              {data.collections.map((collection) => (
                <Link className={rowClass} href={collection.href} key={collection.id} prefetch={false}>
                  <span className="flex size-7 items-center justify-center rounded-lg bg-white/[0.04] text-slate-400">
                    <Folder className="size-4" />
                  </span>
                  <span className="min-w-0 truncate text-slate-200">{collection.name}</span>
                  <span className="text-slate-500 sm:text-right">
                    <TypeBadge>Collection</TypeBadge>
                  </span>
                  <span className="text-xs text-slate-500 sm:text-right">
                    {collection.updatedAtLabel}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="px-3 py-6 font-mono text-sm text-slate-500">
              No favorited collections.
            </p>
          )}
        </section>
      </div>

      <ItemDetailDrawer
        collectionOptions={collectionOptions}
        error={drawer.error}
        item={drawer.item}
        loading={drawer.loading}
        onItemDeleted={() => drawer.onOpenChange(false)}
        onItemUpdated={drawer.replaceItem}
        onOpenChange={drawer.onOpenChange}
        onRetry={drawer.retry}
        open={drawer.open}
      />
    </>
  );
}
