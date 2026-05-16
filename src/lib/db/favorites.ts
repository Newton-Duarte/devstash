import "server-only";

import { prisma } from "@/lib/prisma";

export interface FavoriteItemRow {
  id: string;
  title: string;
  updatedAtLabel: string;
  type: {
    name: string;
    icon: string | null;
    color: string | null;
  };
}

export interface FavoriteCollectionRow {
  id: string;
  name: string;
  href: string;
  itemCount: number;
  updatedAtLabel: string;
}

export interface FavoritesPageData {
  items: FavoriteItemRow[];
  collections: FavoriteCollectionRow[];
}

function formatFavoriteDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export async function getFavoritesPageData(userId: string): Promise<FavoritesPageData> {
  const [items, collections] = await Promise.all([
    prisma.item.findMany({
      where: {
        userId,
        isFavorite: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        title: true,
        updatedAt: true,
        type: {
          select: {
            name: true,
            icon: true,
            color: true,
          },
        },
      },
    }),
    prisma.collection.findMany({
      where: {
        userId,
        isFavorite: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        name: true,
        updatedAt: true,
        _count: {
          select: {
            items: true,
          },
        },
      },
    }),
  ]);

  return {
    items: items.map((item) => ({
      id: item.id,
      title: item.title,
      updatedAtLabel: formatFavoriteDate(item.updatedAt),
      type: item.type,
    })),
    collections: collections.map((collection) => ({
      id: collection.id,
      name: collection.name,
      href: `/collections/${collection.id}`,
      itemCount: collection._count.items,
      updatedAtLabel: formatFavoriteDate(collection.updatedAt),
    })),
  };
}
