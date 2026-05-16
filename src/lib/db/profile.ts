import "server-only";

import { type Prisma } from "@/generated/prisma/client";
import { normalizeEditorPreferences, type EditorPreferences } from "@/lib/editor-preferences";
import { prisma } from "@/lib/prisma";

const PROFILE_ITEM_TYPE_ORDER = ["snippet", "prompt", "note", "command", "link", "file", "image"];

export interface ProfileItemTypeBreakdownItem {
  name: string;
  label: string;
  count: number;
  color: string | null;
  icon: string | null;
}

export interface ProfilePageData {
  user: {
    name: string | null;
    email: string;
    image: string | null;
    createdAt: Date;
    editorPreferences: EditorPreferences;
    hasPassword: boolean;
  };
  stats: {
    totalItems: number;
    totalCollections: number;
    itemTypeBreakdown: ProfileItemTypeBreakdownItem[];
  };
}

function formatItemTypeLabel(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export async function getProfilePageData(userId: string): Promise<ProfilePageData | null> {
  const [user, totalItems, totalCollections, itemTypes, typeCounts] = await Promise.all([
    prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        name: true,
        email: true,
        image: true,
        createdAt: true,
        editorPreferences: true,
        passwordHash: true,
      },
    }),
    prisma.item.count({
      where: {
        userId,
      },
    }),
    prisma.collection.count({
      where: {
        userId,
      },
    }),
    prisma.itemType.findMany({
      where: {
        isSystem: true,
      },
      select: {
        id: true,
        name: true,
        color: true,
        icon: true,
      },
    }),
    prisma.item.groupBy({
      by: ["typeId"],
      where: {
        userId,
      },
      _count: {
        _all: true,
      },
    }),
  ]);

  if (!user) {
    return null;
  }

  const typeCountsById = new Map(typeCounts.map((itemType) => [itemType.typeId, itemType._count._all]));

  const itemTypeBreakdown = itemTypes
    .map((itemType) => ({
      name: itemType.name,
      label: formatItemTypeLabel(itemType.name),
      count: typeCountsById.get(itemType.id) ?? 0,
      color: itemType.color,
      icon: itemType.icon,
    }))
    .sort((left, right) => {
      const leftIndex = PROFILE_ITEM_TYPE_ORDER.indexOf(left.name);
      const rightIndex = PROFILE_ITEM_TYPE_ORDER.indexOf(right.name);

      if (leftIndex === -1 || rightIndex === -1) {
        return left.name.localeCompare(right.name);
      }

      return leftIndex - rightIndex;
    });

  return {
    user: {
      name: user.name,
      email: user.email,
      image: user.image,
      createdAt: user.createdAt,
      editorPreferences: normalizeEditorPreferences(user.editorPreferences as Prisma.JsonValue),
      hasPassword: Boolean(user.passwordHash),
    },
    stats: {
      totalItems,
      totalCollections,
      itemTypeBreakdown,
    },
  };
}
