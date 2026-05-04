import "server-only";

import { type Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const DEMO_USER_EMAIL = "demo@devstash.io";
const NEUTRAL_COLLECTION_ACCENT = "#334155";
const RECENT_COLLECTION_LIMIT = 6;

export interface DashboardCollectionType {
  name: string;
  icon: string | null;
  color: string | null;
}

export interface DashboardCollection {
  id: string;
  name: string;
  description: string;
  isFavorite: boolean;
  itemCount: number;
  accentColor: string;
  types: DashboardCollectionType[];
}

export interface DashboardCollectionStats {
  totalCollections: number;
  favoriteCollections: number;
}

export interface DashboardCollectionsData {
  collections: DashboardCollection[];
  stats: DashboardCollectionStats;
}

type CollectionWithItems = Prisma.CollectionGetPayload<{
  include: {
    _count: {
      select: {
        items: true;
      };
    };
    items: {
      select: {
        type: {
          select: {
            name: true;
            icon: true;
            color: true;
          };
        };
      };
    };
  };
}>;

function getCollectionAccentColor(collection: CollectionWithItems) {
  const typeCounts = new Map<string, { color: string | null; count: number }>();

  for (const item of collection.items) {
    const currentType = typeCounts.get(item.type.name);

    if (currentType) {
      currentType.count += 1;
      continue;
    }

    typeCounts.set(item.type.name, {
      color: item.type.color,
      count: 1,
    });
  }

  const mostUsedType = [...typeCounts.entries()].sort((left, right) => {
    if (right[1].count !== left[1].count) {
      return right[1].count - left[1].count;
    }

    return left[0].localeCompare(right[0]);
  })[0];

  return mostUsedType?.[1].color ?? NEUTRAL_COLLECTION_ACCENT;
}

function getCollectionTypes(collection: CollectionWithItems) {
  const uniqueTypes = new Map<string, DashboardCollectionType>();

  for (const item of collection.items) {
    if (uniqueTypes.has(item.type.name)) {
      continue;
    }

    uniqueTypes.set(item.type.name, {
      name: item.type.name,
      icon: item.type.icon,
      color: item.type.color,
    });
  }

  return [...uniqueTypes.values()].sort((left, right) =>
    left.name.localeCompare(right.name)
  );
}

function mapDashboardCollection(collection: CollectionWithItems): DashboardCollection {
  return {
    id: collection.id,
    name: collection.name,
    description: collection.description ?? "No description yet",
    isFavorite: collection.isFavorite,
    itemCount: collection._count.items,
    accentColor: getCollectionAccentColor(collection),
    types: getCollectionTypes(collection),
  };
}

export async function getDashboardCollectionsData(): Promise<DashboardCollectionsData> {
  const user = await prisma.user.findUnique({
    where: {
      email: DEMO_USER_EMAIL,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    return {
      collections: [],
      stats: {
        totalCollections: 0,
        favoriteCollections: 0,
      },
    };
  }

  const [collections, totalCollections, favoriteCollections] = await Promise.all([
    prisma.collection.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: RECENT_COLLECTION_LIMIT,
      include: {
        _count: {
          select: {
            items: true,
          },
        },
        items: {
          select: {
            type: {
              select: {
                name: true,
                icon: true,
                color: true,
              },
            },
          },
        },
      },
    }),
    prisma.collection.count({
      where: {
        userId: user.id,
      },
    }),
    prisma.collection.count({
      where: {
        userId: user.id,
        isFavorite: true,
      },
    }),
  ]);

  return {
    collections: collections.map(mapDashboardCollection),
    stats: {
      totalCollections,
      favoriteCollections,
    },
  };
}
