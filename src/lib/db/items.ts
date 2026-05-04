import "server-only";

import { type Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const DEMO_USER_EMAIL = "demo@devstash.io";
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

export async function getDashboardItemsData(): Promise<DashboardItemsData> {
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
      pinnedItems: [],
      recentItems: [],
      stats: {
        totalItems: 0,
        favoriteItems: 0,
      },
    };
  }

  const [pinnedItems, recentItems, totalItems, favoriteItems] = await Promise.all([
    prisma.item.findMany({
      where: {
        userId: user.id,
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
        userId: user.id,
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
        userId: user.id,
      },
    }),
    prisma.item.count({
      where: {
        userId: user.id,
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
