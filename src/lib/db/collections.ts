import "server-only";

import { type Prisma } from "@/generated/prisma/client";
import { type CreateCollectionData } from "@/lib/collections/create-collection-schema";
import { type UpdateCollectionData } from "@/lib/collections/update-collection-schema";
import { type ItemListItem } from "@/lib/db/item-list";
import {
  COLLECTIONS_PER_PAGE,
  DASHBOARD_COLLECTIONS_LIMIT,
  ITEMS_PER_PAGE,
  getPaginationMeta,
  getPaginationSkip,
  type PaginationMeta,
} from "@/lib/pagination";
import { prisma } from "@/lib/prisma";

const NEUTRAL_COLLECTION_ACCENT = "#334155";

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

export interface CollectionsPageData extends DashboardCollectionsData {
  pagination: PaginationMeta;
}

export interface CollectionDetailPageData {
  collection: DashboardCollection;
  items: ItemListItem[];
  itemGroups: CollectionItemGroup[];
  pagination: PaginationMeta;
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

export type UpdatedCollection = CreatedCollection;

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

type CollectionSummary = Prisma.CollectionGetPayload<{
  include: {
    _count: {
      select: {
        items: true;
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

function mapCollectionSummary(
  collection: CollectionSummary,
  types: DashboardCollectionType[]
): DashboardCollection {
  const primaryType = types[0];

  return {
    id: collection.id,
    name: collection.name,
    description: collection.description ?? "No description yet",
    isFavorite: collection.isFavorite,
    itemCount: collection._count.items,
    accentColor: primaryType?.color ?? NEUTRAL_COLLECTION_ACCENT,
    types,
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
      take: DASHBOARD_COLLECTIONS_LIMIT,
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

export async function getCollectionsPageData(
  userId: string,
  requestedPage = 1
): Promise<CollectionsPageData> {
  const [totalCollections, favoriteCollections] = await Promise.all([
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
  const pagination = getPaginationMeta(totalCollections, requestedPage, COLLECTIONS_PER_PAGE);
  const collections = await prisma.collection.findMany({
    where: {
      userId,
    },
    orderBy: {
      updatedAt: "desc",
    },
    skip: getPaginationSkip(pagination.currentPage, COLLECTIONS_PER_PAGE),
    take: COLLECTIONS_PER_PAGE,
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
  });

  return {
    collections: collections.map(mapDashboardCollection),
    stats: {
      totalCollections,
      favoriteCollections,
    },
    pagination,
  };
}

export async function getCollectionDetailPageData(
  userId: string,
  collectionId: string,
  requestedPage = 1
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
    },
  });

  if (!collection) {
    return null;
  }

  const pagination = getPaginationMeta(
    collection._count.items,
    requestedPage,
    ITEMS_PER_PAGE
  );
  const [items, typeCounts] = await Promise.all([
    prisma.itemCollection.findMany({
      where: {
        collectionId: collection.id,
      },
      orderBy: {
        item: {
          updatedAt: "desc",
        },
      },
      skip: getPaginationSkip(pagination.currentPage, ITEMS_PER_PAGE),
      take: ITEMS_PER_PAGE,
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
                id: true,
                name: true,
                icon: true,
                color: true,
              },
            },
          },
        },
      },
    }),
    prisma.item.groupBy({
      by: ["typeId"],
      where: {
        userId,
        collections: {
          some: {
            collectionId: collection.id,
          },
        },
      },
      _count: {
        _all: true,
      },
      orderBy: {
        _count: {
          typeId: "desc",
        },
      },
    }),
  ]);
  const itemTypes = await prisma.itemType.findMany({
    where: {
      id: {
        in: typeCounts.map((typeCount) => typeCount.typeId),
      },
    },
    select: {
      id: true,
      name: true,
      icon: true,
      color: true,
    },
  });
  const itemTypesById = new Map(itemTypes.map((itemType) => [itemType.id, itemType]));
  const collectionTypes = typeCounts
    .map((typeCount) => itemTypesById.get(typeCount.typeId))
    .filter((itemType): itemType is NonNullable<typeof itemType> => Boolean(itemType))
    .map((itemType) => ({
      name: itemType.name,
      icon: itemType.icon,
      color: itemType.color,
    }));
  const collectionItems = items.map(mapCollectionItem);

  return {
    collection: mapCollectionSummary(collection, collectionTypes),
    items: collectionItems,
    itemGroups: getCollectionItemGroups(collectionItems),
    pagination,
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

export async function updateCollection(
  userId: string,
  collectionId: string,
  data: UpdateCollectionData
): Promise<UpdatedCollection | null> {
  const collection = await prisma.collection.findFirst({
    where: {
      id: collectionId,
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!collection) {
    return null;
  }

  return prisma.collection.update({
    where: {
      id: collection.id,
    },
    data: {
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

export async function deleteCollection(userId: string, collectionId: string) {
  const collection = await prisma.collection.findFirst({
    where: {
      id: collectionId,
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!collection) {
    return false;
  }

  await prisma.collection.delete({
    where: {
      id: collection.id,
    },
  });

  return true;
}
