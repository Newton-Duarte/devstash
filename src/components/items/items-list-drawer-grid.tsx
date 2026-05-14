"use client";

import { ItemDetailDrawer } from "@/components/items/item-detail-drawer";
import { ImageThumbnailCard } from "@/components/items/image-thumbnail-card";
import { ItemCard } from "@/components/items/item-card";
import { useItemDrawer } from "@/components/items/use-item-drawer";
import { type ItemListItem } from "@/lib/db/item-list";

interface ItemsListDrawerGridProps {
  items: ItemListItem[];
  itemTypeName: string;
}

export function ItemsListDrawerGrid({ items, itemTypeName }: ItemsListDrawerGridProps) {
  const drawer = useItemDrawer();
  const showImageGallery = itemTypeName === "image";

  return (
    <>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) =>
          showImageGallery ? (
            <ImageThumbnailCard item={item} key={item.id} onOpen={drawer.openItem} />
          ) : (
            <ItemCard item={item} key={item.id} onOpen={drawer.openItem} />
          )
        )}
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
