import "server-only";

import { type Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const DEMO_USER_EMAIL = "demo@devstash.io";
const NEUTRAL_COLLECTION_ACCENT = "#334155";
const RECENT_COLLECTION_LIMIT = 3;
const TYPE_ROUTE_SEGMENTS: Record<string, string> = {
  snippet: "snippets",
  prompt: "prompts",
  command: "commands",
  note: "notes",
  file: "files",
  image: "images",
  link: "links",
};
const TYPE_DISPLAY_ORDER = Object.keys(TYPE_ROUTE_SEGMENTS);

export interface DashboardSidebarItemType {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  count: number;
  href: string;
}

export interface DashboardSidebarCollection {
  id: string;
  name: string;
  itemCount: number;
  isFavorite: boolean;
  accentColor: string;
  href: string;
}

export interface DashboardSidebarData {
  itemTypes: DashboardSidebarItemType[];
  favoriteCollections: DashboardSidebarCollection[];
  recentCollections: DashboardSidebarCollection[];
  viewAllCollectionsHref: string;
}

type SidebarCollectionWithItems = Prisma.CollectionGetPayload<{
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
            color: true;
          };
        };
      };
    };
  };
}>;

function getCollectionAccentColor(collection: SidebarCollectionWithItems) {
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

  let mostUsedType: { name: string; color: string | null; count: number } | null = null;

  for (const [name, value] of typeCounts.entries()) {
    if (
      !mostUsedType ||
      value.count > mostUsedType.count ||
      (value.count === mostUsedType.count && name.localeCompare(mostUsedType.name) < 0)
    ) {
      mostUsedType = {
        name,
        color: value.color,
        count: value.count,
      };
    }
  }

  return mostUsedType?.color ?? NEUTRAL_COLLECTION_ACCENT;
}

function mapSidebarCollection(
  collection: SidebarCollectionWithItems
): DashboardSidebarCollection {
  return {
    id: collection.id,
    name: collection.name,
    itemCount: collection._count.items,
    isFavorite: collection.isFavorite,
    accentColor: getCollectionAccentColor(collection),
    href: `/collections/${collection.id}`,
  };
}

export async function getDashboardSidebarData(): Promise<DashboardSidebarData> {
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
      itemTypes: [],
      favoriteCollections: [],
      recentCollections: [],
      viewAllCollectionsHref: "/collections",
    };
  }

  const [itemTypes, typeCounts, favoriteCollections, recentCollections] = await Promise.all([
    prisma.itemType.findMany({
      where: {
        isSystem: true,
      },
      select: {
        id: true,
        name: true,
        icon: true,
        color: true,
      },
    }),
    prisma.item.groupBy({
      by: ["typeId"],
      where: {
        userId: user.id,
      },
      _count: {
        _all: true,
      },
    }),
    prisma.collection.findMany({
      where: {
        userId: user.id,
        isFavorite: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
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
                color: true,
              },
            },
          },
        },
      },
    }),
    prisma.collection.findMany({
      where: {
        userId: user.id,
        isFavorite: false,
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
                color: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const typeCountsById = new Map(
    typeCounts.map((itemTypeCount) => [itemTypeCount.typeId, itemTypeCount._count._all])
  );

  return {
    itemTypes: itemTypes
      .map((itemType) => ({
        id: itemType.id,
        name: itemType.name,
        icon: itemType.icon,
        color: itemType.color,
        count: typeCountsById.get(itemType.id) ?? 0,
        href: `/items/${TYPE_ROUTE_SEGMENTS[itemType.name] ?? `${itemType.name}s`}`,
      }))
      .sort((left, right) => {
        const leftIndex = TYPE_DISPLAY_ORDER.indexOf(left.name);
        const rightIndex = TYPE_DISPLAY_ORDER.indexOf(right.name);

        if (leftIndex === -1 || rightIndex === -1) {
          return left.name.localeCompare(right.name);
        }

        return leftIndex - rightIndex;
      }),
    favoriteCollections: favoriteCollections.map(mapSidebarCollection),
    recentCollections: recentCollections.map(mapSidebarCollection),
    viewAllCollectionsHref: "/collections",
  };
}
