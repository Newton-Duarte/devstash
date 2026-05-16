import "server-only";

import { prisma } from "@/lib/prisma";
import { type GlobalSearchData } from "@/lib/search/global-search";

const PREVIEW_LENGTH = 120;

function getPreview(...values: Array<string | null>) {
  const preview = values.find((value) => value?.trim())?.trim() ?? "No preview available";

  return preview.length > PREVIEW_LENGTH ? `${preview.slice(0, PREVIEW_LENGTH).trim()}...` : preview;
}

export async function getGlobalSearchData(userId: string): Promise<GlobalSearchData> {
  const [items, collections] = await Promise.all([
    prisma.item.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        title: true,
        description: true,
        content: true,
        fileName: true,
        url: true,
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
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        name: true,
        description: true,
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
      preview: getPreview(item.description, item.content, item.fileName, item.url),
      type: item.type,
    })),
    collections: collections.map((collection) => ({
      id: collection.id,
      name: collection.name,
      preview: getPreview(collection.description),
      itemCount: collection._count.items,
    })),
  };
}
