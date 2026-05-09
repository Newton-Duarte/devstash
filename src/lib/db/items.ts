import "server-only";

import { type Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const PINNED_ITEMS_LIMIT = 6;
const RECENT_ITEMS_LIMIT = 10;

export interface DashboardItemType {
  name: string;
  icon: string | null;
  color: string | null;
}

export interface DashboardItem {
  id: string;
  title: string;
  description: string;
  isFavorite: boolean;
  isPinned: boolean;
  url: string | null;
  updatedAtLabel: string;
  tags: string[];
  type: DashboardItemType;
}

export interface DashboardItemStats {
  totalItems: number;
  favoriteItems: number;
}

export interface DashboardItemsData {
  pinnedItems: DashboardItem[];
  recentItems: DashboardItem[];
  stats: DashboardItemStats;
}

export interface ItemDetail {
  id: string;
  title: string;
  description: string;
  contentType: string;
  content: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  url: string | null;
  language: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  createdAtLabel: string;
  updatedAtLabel: string;
  tags: string[];
  type: DashboardItemType;
  collection: {
    name: string;
  } | null;
}

type ItemWithRelations = Prisma.ItemGetPayload<{
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
}>;

function formatItemDate(updatedAt: Date) {
  return updatedAt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatItemDateTime(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function mapDashboardItem(item: ItemWithRelations): DashboardItem {
  return {
    id: item.id,
    title: item.title,
    description: item.description ?? "No description yet",
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

export async function getDashboardItemsData(userId: string): Promise<DashboardItemsData> {
  const [pinnedItems, recentItems, totalItems, favoriteItems] = await Promise.all([
    prisma.item.findMany({
      where: {
        userId,
        isPinned: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: PINNED_ITEMS_LIMIT,
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
    }),
    prisma.item.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: RECENT_ITEMS_LIMIT,
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
    }),
    prisma.item.count({
      where: {
        userId,
      },
    }),
    prisma.item.count({
      where: {
        userId,
        isFavorite: true,
      },
    }),
  ]);

  return {
    pinnedItems: pinnedItems.map(mapDashboardItem),
    recentItems: recentItems.map(mapDashboardItem),
    stats: {
      totalItems,
      favoriteItems,
    },
  };
}

export async function getItemDetail(userId: string, itemId: string): Promise<ItemDetail | null> {
  const item = await prisma.item.findFirst({
    where: {
      id: itemId,
      userId,
    },
    include: {
      collection: {
        select: {
          name: true,
        },
      },
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
  });

  if (!item) {
    return null;
  }

  return {
    id: item.id,
    title: item.title,
    description: item.description ?? "No description yet",
    contentType: item.contentType,
    content: item.content,
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    fileSize: item.fileSize,
    url: item.url,
    language: item.language,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    createdAtLabel: formatItemDateTime(item.createdAt),
    updatedAtLabel: formatItemDateTime(item.updatedAt),
    tags: item.tags.map(({ tag }) => tag.name),
    type: {
      name: item.type.name,
      icon: item.type.icon,
      color: item.type.color,
    },
    collection: item.collection
      ? {
          name: item.collection.name,
        }
      : null,
  };
}
