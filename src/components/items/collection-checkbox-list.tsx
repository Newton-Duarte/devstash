import { type CollectionOption } from "@/lib/db/collections";

interface CollectionCheckboxListProps {
  collectionIds: string[];
  collections: CollectionOption[];
  disabled?: boolean;
  onChange: (collectionIds: string[]) => void;
}

export function CollectionCheckboxList({
  collectionIds,
  collections,
  disabled = false,
  onChange,
}: CollectionCheckboxListProps) {
  const selectedCollectionIds = new Set(collectionIds);

  const toggleCollection = (collectionId: string) => {
    if (selectedCollectionIds.has(collectionId)) {
      onChange(collectionIds.filter((currentId) => currentId !== collectionId));
      return;
    }

    onChange([...collectionIds, collectionId]);
  };

  if (collections.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-500">
        Create a collection first to organize this item.
      </p>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {collections.map((collection) => {
        const selected = selectedCollectionIds.has(collection.id);

        return (
          <label
            className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-200 transition hover:border-white/20 hover:bg-white/[0.06]"
            key={collection.id}
          >
            <input
              checked={selected}
              className="size-4 rounded border-white/20 bg-white/[0.04] accent-white"
              disabled={disabled}
              onChange={() => toggleCollection(collection.id)}
              type="checkbox"
            />
            <span className="min-w-0 truncate">{collection.name}</span>
          </label>
        );
      })}
    </div>
  );
}
