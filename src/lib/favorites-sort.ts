import type { FavoriteItemRow, FavoritesPageData } from "@/lib/db/favorites";

export type FavoriteItemSort = "date" | "name" | "type";
export type FavoriteCollectionSort = "date" | "name";

export function sortFavoriteItems(items: FavoriteItemRow[], sort: FavoriteItemSort) {
  return [...items].sort((first, second) => {
    if (sort === "name") {
      return first.title.localeCompare(second.title);
    }

    if (sort === "type") {
      const typeSort = first.type.name.localeCompare(second.type.name);

      return typeSort || first.title.localeCompare(second.title);
    }

    return second.updatedAt.localeCompare(first.updatedAt);
  });
}

export function sortFavoriteCollections(
  collections: FavoritesPageData["collections"],
  sort: FavoriteCollectionSort
) {
  return [...collections].sort((first, second) => {
    if (sort === "name") {
      return first.name.localeCompare(second.name);
    }

    return second.updatedAt.localeCompare(first.updatedAt);
  });
}
