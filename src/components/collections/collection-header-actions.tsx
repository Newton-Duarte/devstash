"use client";

import { Edit3, Trash2 } from "lucide-react";

import { CollectionDeleteDialog } from "@/components/collections/collection-delete-dialog";
import { CollectionEditDialog } from "@/components/collections/collection-edit-dialog";
import { FavoriteToggleButton } from "@/components/shared/favorite-toggle-button";
import { type DashboardCollection } from "@/lib/db/collections";

interface CollectionHeaderActionsProps {
  collection: DashboardCollection;
}

const actionClass =
  "inline-flex h-10 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-slate-300 transition hover:bg-white/[0.08] hover:text-white focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

export function CollectionHeaderActions({ collection }: CollectionHeaderActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <CollectionEditDialog collection={collection}>
        <button className={actionClass} type="button">
          <Edit3 className="size-4" />
          Edit
        </button>
      </CollectionEditDialog>

      <FavoriteToggleButton
        className={actionClass}
        iconClassName="size-4"
        id={collection.id}
        isFavorite={collection.isFavorite}
        label={`${collection.isFavorite ? "Unfavorite" : "Favorite"} ${collection.name}`}
        resource="collection"
        showText
      />

      <CollectionDeleteDialog
        collectionId={collection.id}
        collectionName={collection.name}
        redirectTo="/collections"
      >
        <button
          className="inline-flex h-10 items-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 text-sm font-medium text-red-200 transition hover:bg-red-500/15 hover:text-red-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          type="button"
        >
          <Trash2 className="size-4" />
          Delete
        </button>
      </CollectionDeleteDialog>
    </div>
  );
}
