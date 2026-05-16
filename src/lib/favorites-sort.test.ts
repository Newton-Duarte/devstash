import { describe, expect, it } from "vitest";

import {
  sortFavoriteCollections,
  sortFavoriteItems,
} from "@/lib/favorites-sort";

const favoriteItems = [
  {
    id: "item-1",
    title: "Zed snippet",
    updatedAt: "2026-01-02T00:00:00.000Z",
    updatedAtLabel: "Jan 2, 2026",
    type: { name: "Snippet", icon: null, color: null },
  },
  {
    id: "item-2",
    title: "Alpha command",
    updatedAt: "2026-01-03T00:00:00.000Z",
    updatedAtLabel: "Jan 3, 2026",
    type: { name: "Command", icon: null, color: null },
  },
  {
    id: "item-3",
    title: "Beta command",
    updatedAt: "2026-01-01T00:00:00.000Z",
    updatedAtLabel: "Jan 1, 2026",
    type: { name: "Command", icon: null, color: null },
  },
];

const favoriteCollections = [
  {
    id: "collection-1",
    name: "Zed collection",
    href: "/collections/collection-1",
    itemCount: 2,
    updatedAt: "2026-01-02T00:00:00.000Z",
    updatedAtLabel: "Jan 2, 2026",
  },
  {
    id: "collection-2",
    name: "Alpha collection",
    href: "/collections/collection-2",
    itemCount: 1,
    updatedAt: "2026-01-03T00:00:00.000Z",
    updatedAtLabel: "Jan 3, 2026",
  },
];

describe("favorites sorting", () => {
  it("sorts favorite items by newest date first", () => {
    expect(sortFavoriteItems(favoriteItems, "date").map((item) => item.id)).toEqual([
      "item-2",
      "item-1",
      "item-3",
    ]);
  });

  it("sorts favorite items by name", () => {
    expect(sortFavoriteItems(favoriteItems, "name").map((item) => item.id)).toEqual([
      "item-2",
      "item-3",
      "item-1",
    ]);
  });

  it("sorts favorite items by type and title", () => {
    expect(sortFavoriteItems(favoriteItems, "type").map((item) => item.id)).toEqual([
      "item-2",
      "item-3",
      "item-1",
    ]);
  });

  it("sorts favorite collections by newest date first", () => {
    expect(sortFavoriteCollections(favoriteCollections, "date").map((collection) => collection.id)).toEqual([
      "collection-2",
      "collection-1",
    ]);
  });

  it("sorts favorite collections by name", () => {
    expect(sortFavoriteCollections(favoriteCollections, "name").map((collection) => collection.id)).toEqual([
      "collection-2",
      "collection-1",
    ]);
  });
});
