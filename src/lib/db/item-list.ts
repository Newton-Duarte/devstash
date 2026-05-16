import "server-only";

import { type Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getItemTypeNameFromRouteSegment, getItemTypePluralLabel } from "@/lib/item-type-routes";
import {
  ITEMS_PER_PAGE,
  getPaginationMeta,
  getPaginationSkip,
  type PaginationMeta,
} from "@/lib/pagination";

interface ItemListItemType {
  name: string;
  icon: string | null;
  color: string | null;
}

export interface ItemListItem {
  id: string;
  title: string;
  description: string;
  fileName: string | null;
  fileSize: number | null;
  createdAtLabel: string;
  isFavorite: boolean;
  isPinned: boolean;
  url: string | null;
  updatedAtLabel: string;
  tags: string[];
  type: ItemListItemType;
}

export interface ItemListPageData {
  itemType: {
    name: string;
    label: string;
    color: string | null;
  };
  items: ItemListItem[];
  pagination: PaginationMeta;
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

function mapItem(item: ItemWithRelations): ItemListItem {
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

export async function getItemsListPageData(
  userId: string,
  routeSegment: string,
  requestedPage = 1
) {
  const typeName = getItemTypeNameFromRouteSegment(routeSegment);

  if (!typeName) {
    return null;
  }

  const itemType = await prisma.itemType.findFirst({
    where: {
      isSystem: true,
      name: typeName,
    },
    select: {
      id: true,
      name: true,
      color: true,
    },
  });

  if (!itemType) {
    return null;
  }

  const itemWhere = {
    userId,
    typeId: itemType.id,
  } satisfies Prisma.ItemWhereInput;
  const totalItems = await prisma.item.count({
    where: itemWhere,
  });
  const pagination = getPaginationMeta(totalItems, requestedPage, ITEMS_PER_PAGE);
  const items = await prisma.item.findMany({
    where: itemWhere,
    orderBy: {
      updatedAt: "desc",
    },
    skip: getPaginationSkip(pagination.currentPage, ITEMS_PER_PAGE),
    take: ITEMS_PER_PAGE,
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
  });

  return {
    itemType: {
      name: itemType.name,
      label: getItemTypePluralLabel(itemType.name),
      color: itemType.color,
    },
    items: items.map(mapItem),
    pagination,
  } satisfies ItemListPageData;
}
