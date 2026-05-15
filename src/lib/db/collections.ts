import "server-only";

import { type Prisma } from "@/generated/prisma/client";
import { type CreateCollectionData } from "@/lib/collections/create-collection-schema";
import { type ItemListItem } from "@/lib/db/item-list";
import { prisma } from "@/lib/prisma";

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

export type CollectionsPageData = DashboardCollectionsData;

export interface CollectionDetailPageData {
  collection: DashboardCollection;
  items: ItemListItem[];
  itemGroups: CollectionItemGroup[];
}

export interface CollectionItemGroup {
  layout: "cards" | "files" | "images";
  label: string;
  items: ItemListItem[];
}

export interface CreatedCollection {
  id: string;
  name: string;
  description: string | null;
}

export interface CollectionOption {
  id: string;
  name: string;
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
        item: {
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
    };
  };
}>;

type CollectionDetailWithItems = Prisma.CollectionGetPayload<{
  include: {
    _count: {
      select: {
        items: true;
      };
    };
    items: {
      select: {
        item: {
          include: {
            tags: {
              select: {
                tag: {
                  select: {
                    name: true;
                  };
                };
              };
            };
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
    };
  };
}>;

function getCollectionAccentColor(collection: CollectionWithItems) {
  const typeCounts = new Map<string, { color: string | null; count: number }>();

  for (const item of collection.items) {
    const currentType = typeCounts.get(item.item.type.name);

    if (currentType) {
      currentType.count += 1;
      continue;
    }

    typeCounts.set(item.item.type.name, {
      color: item.item.type.color,
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
    if (uniqueTypes.has(item.item.type.name)) {
      continue;
    }

    uniqueTypes.set(item.item.type.name, {
      name: item.item.type.name,
      icon: item.item.type.icon,
      color: item.item.type.color,
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

function formatItemDate(updatedAt: Date) {
  return updatedAt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function mapCollectionItem({ item }: CollectionDetailWithItems["items"][number]): ItemListItem {
  return {
    id: item.id,
    title: item.title,
    description: item.description ?? "No description yet",
    fileName: item.fileName,
    fileSize: item.fileSize,
    createdAtLabel: formatItemDate(item.createdAt),
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    url: item.url,
    updatedAtLabel: formatItemDate(item.updatedAt),
    tags: item.tags.map(({ tag }) => tag.name),
    type: {
      name: item.type.name,
      icon: item.type.icon,
      color: item.type.color,
    },
  };
}

function getCollectionItemGroups(items: ItemListItem[]): CollectionItemGroup[] {
  const cardItems: ItemListItem[] = [];
  const fileItems: ItemListItem[] = [];
  const imageItems: ItemListItem[] = [];

  for (const item of items) {
    if (item.type.name === "file") {
      fileItems.push(item);
      continue;
    }

    if (item.type.name === "image") {
      imageItems.push(item);
      continue;
    }

    cardItems.push(item);
  }

  const groups: CollectionItemGroup[] = [
    { layout: "cards", label: "Items", items: cardItems },
    { layout: "files", label: "Files", items: fileItems },
    { layout: "images", label: "Images", items: imageItems },
  ];

  return groups.filter((group) => group.items.length > 0);
}

export async function getDashboardCollectionsData(
  userId: string
): Promise<DashboardCollectionsData> {
  const [collections, totalCollections, favoriteCollections] = await Promise.all([
    prisma.collection.findMany({
      where: {
        userId,
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
            item: {
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
        },
      },
    }),
    prisma.collection.count({
      where: {
        userId,
      },
    }),
    prisma.collection.count({
      where: {
        userId,
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

export async function getCollectionsPageData(userId: string): Promise<CollectionsPageData> {
  const [collections, totalCollections, favoriteCollections] = await Promise.all([
    prisma.collection.findMany({
      where: {
        userId,
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
            item: {
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
        },
      },
    }),
    prisma.collection.count({
      where: {
        userId,
      },
    }),
    prisma.collection.count({
      where: {
        userId,
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

export async function getCollectionDetailPageData(
  userId: string,
  collectionId: string
): Promise<CollectionDetailPageData | null> {
  const collection = await prisma.collection.findFirst({
    where: {
      id: collectionId,
      userId,
    },
    include: {
      _count: {
        select: {
          items: true,
        },
      },
      items: {
        orderBy: {
          item: {
            updatedAt: "desc",
          },
        },
        select: {
          item: {
            include: {
              tags: {
                select: {
                  tag: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
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
      },
    },
  });

  if (!collection) {
    return null;
  }

  const items = collection.items.map(mapCollectionItem);

  return {
    collection: mapDashboardCollection(collection),
    items,
    itemGroups: getCollectionItemGroups(items),
  };
}

export async function getCollectionOptions(userId: string): Promise<CollectionOption[]> {
  return prisma.collection.findMany({
    where: {
      userId,
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
    },
  });
}

export async function createCollection(
  userId: string,
  data: CreateCollectionData
): Promise<CreatedCollection> {
  return prisma.collection.create({
    data: {
      userId,
      name: data.name,
      description: data.description,
    },
    select: {
      id: true,
      name: true,
      description: true,
    },
  });
}
