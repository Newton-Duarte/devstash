"use client";

import { ItemDetailDrawer } from "@/components/items/item-detail-drawer";
import { FileListRow } from "@/components/items/file-list-row";
import { ImageThumbnailCard } from "@/components/items/image-thumbnail-card";
import { ItemCard } from "@/components/items/item-card";
import { useItemDrawer } from "@/components/items/use-item-drawer";
import { type CollectionOption } from "@/lib/db/collections";
import { type ItemListItem } from "@/lib/db/item-list";

interface ItemsListDrawerGridProps {
  collectionOptions: CollectionOption[];
  items: ItemListItem[];
  itemTypeName: string;
}

export function ItemsListDrawerGrid({
  collectionOptions,
  items,
  itemTypeName,
}: ItemsListDrawerGridProps) {
  const drawer = useItemDrawer();
  const showFileList = itemTypeName === "file";
  const showImageGallery = itemTypeName === "image";

  return (
    <>
      {showFileList ? (
        <div className="rounded-[1.6rem] border border-white/10 bg-[#0d0e12] p-3 shadow-2xl shadow-black/10">
          <div className="hidden grid-cols-[minmax(0,1fr)_120px_120px_auto] gap-4 px-4 py-3 text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase sm:grid">
            <span>Name</span>
            <span>Size</span>
            <span>Uploaded</span>
            <span className="sr-only">Download</span>
          </div>
          <div className="space-y-2">
            {items.map((item) => (
              <FileListRow item={item} key={item.id} onOpen={drawer.openItem} />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) =>
            showImageGallery ? (
              <ImageThumbnailCard item={item} key={item.id} onOpen={drawer.openItem} />
            ) : (
              <ItemCard item={item} key={item.id} onOpen={drawer.openItem} />
            )
          )}
        </div>
      )}
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
