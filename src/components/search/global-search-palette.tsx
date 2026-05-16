"use client";

import { Folder } from "lucide-react";
import { useDeferredValue, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { DashboardItemTypeIcon } from "@/components/dashboard/dashboard-item-type-icon";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  getGlobalSearchResults,
  type GlobalSearchData,
} from "@/lib/search/global-search";

interface GlobalSearchPaletteProps {
  data: GlobalSearchData;
  onItemSelect: (itemId: string) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function GlobalSearchPalette({
  data,
  onItemSelect,
  onOpenChange,
  open,
}: GlobalSearchPaletteProps) {
  const [query, setQuery] = useState("");
  const [, startTransition] = useTransition();
  const deferredQuery = useDeferredValue(query);
  const router = useRouter();
  const results = getGlobalSearchResults(data, deferredQuery);
  const hasResults = results.items.length > 0 || results.collections.length > 0;

  const selectItem = (itemId: string) => {
    onOpenChange(false);
    setQuery("");
    onItemSelect(itemId);
  };

  const selectCollection = (collectionId: string) => {
    onOpenChange(false);
    setQuery("");

    startTransition(() => {
      router.push(`/collections/${collectionId}`);
    });
  };

  return (
    <CommandDialog
      label="Global search"
      onOpenChange={onOpenChange}
      open={open}
      shouldFilter={false}
    >
      <div className="border-b border-white/10 bg-white/[0.02]">
        <CommandInput
          onValueChange={setQuery}
          placeholder="Search items and collections..."
          value={query}
        />
      </div>
      <CommandList>
        {hasResults ? null : <CommandEmpty>No items or collections found.</CommandEmpty>}

        {results.items.length > 0 ? (
          <CommandGroup heading="Items">
            {results.items.map((item) => (
              <CommandItem
                key={item.id}
                onSelect={() => selectItem(item.id)}
                value={`item-${item.id}`}
              >
                <div
                  className="flex size-10 shrink-0 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: `${item.type.color ?? "#334155"}1f` }}
                >
                  <DashboardItemTypeIcon className="size-4" type={item.type} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-slate-100">{item.title}</p>
                    <span
                      className="shrink-0 rounded-lg border border-white/10 px-2 py-0.5 text-[0.68rem] font-medium capitalize"
                      style={{ color: item.type.color ?? "#cbd5e1" }}
                    >
                      {item.type.name}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-slate-500">{item.preview}</p>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        ) : null}

        {results.items.length > 0 && results.collections.length > 0 ? (
          <CommandSeparator />
        ) : null}

        {results.collections.length > 0 ? (
          <CommandGroup heading="Collections">
            {results.collections.map((collection) => (
              <CommandItem
                key={collection.id}
                onSelect={() => selectCollection(collection.id)}
                value={`collection-${collection.id}`}
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white/[0.06] text-slate-300">
                  <Folder className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-slate-100">{collection.name}</p>
                    <span className="shrink-0 rounded-lg border border-white/10 px-2 py-0.5 text-[0.68rem] font-medium text-slate-400">
                      {collection.itemCount} {collection.itemCount === 1 ? "item" : "items"}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-slate-500">{collection.preview}</p>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        ) : null}
      </CommandList>
    </CommandDialog>
  );
}
