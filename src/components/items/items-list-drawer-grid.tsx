"use client";

import { ItemDetailDrawer } from "@/components/items/item-detail-drawer";
import { ItemCard } from "@/components/items/item-card";
import { useItemDrawer } from "@/components/items/use-item-drawer";
import { type ItemListItem } from "@/lib/db/item-list";

interface ItemsListDrawerGridProps {
  items: ItemListItem[];
}

export function ItemsListDrawerGrid({ items }: ItemsListDrawerGridProps) {
  const drawer = useItemDrawer();

  return (
    <>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <ItemCard item={item} key={item.id} onOpen={drawer.openItem} />
        ))}
      </div>
      <ItemDetailDrawer
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
