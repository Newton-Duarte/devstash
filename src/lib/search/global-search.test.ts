import { describe, expect, it } from "vitest";

import { getGlobalSearchResults, type GlobalSearchData } from "@/lib/search/global-search";

const searchData: GlobalSearchData = {
  items: [
    {
      id: "item-1",
      title: "React Hooks Snippet",
      preview: "Reusable useEffect cleanup pattern",
      type: {
        name: "snippet",
        icon: "Code",
        color: "#38bdf8",
      },
    },
    {
      id: "item-2",
      title: "Deploy Command",
      preview: "pnpm build && pnpm start",
      type: {
        name: "command",
        icon: "Terminal",
        color: "#22c55e",
      },
    },
    {
      id: "item-3",
      title: "Team Setup Guide",
      preview: "Onboarding checklist for local environments",
      type: {
        name: "note",
        icon: "StickyNote",
        color: "#f59e0b",
      },
    },
  ],
  collections: [
    {
      id: "collection-1",
      name: "React Patterns",
      preview: "Hooks, components, and server patterns",
      itemCount: 8,
    },
    {
      id: "collection-2",
      name: "Deployment Notes",
      preview: "Release checklists and hosting commands",
      itemCount: 3,
    },
  ],
};

describe("getGlobalSearchResults", () => {
  it("returns leading records when the query is empty", () => {
    const results = getGlobalSearchResults(searchData, "", 1);

    expect(results.items).toEqual([searchData.items[0]]);
    expect(results.collections).toEqual([searchData.collections[0]]);
  });

  it("matches item titles, types, and previews", () => {
    const byTitle = getGlobalSearchResults(searchData, "hooks");
    const byType = getGlobalSearchResults(searchData, "command");
    const byPreview = getGlobalSearchResults(searchData, "cleanup");

    expect(byTitle.items.map((item) => item.id)).toEqual(["item-1"]);
    expect(byType.items.map((item) => item.id)).toEqual(["item-2"]);
    expect(byPreview.items.map((item) => item.id)).toEqual(["item-1"]);
  });

  it("matches collection names and previews", () => {
    const byName = getGlobalSearchResults(searchData, "deployment");
    const byPreview = getGlobalSearchResults(searchData, "server");

    expect(byName.collections.map((collection) => collection.id)).toEqual([
      "collection-2",
    ]);
    expect(byPreview.collections.map((collection) => collection.id)).toEqual([
      "collection-1",
    ]);
  });

  it("supports fuzzy ordered-character matching", () => {
    const itemResults = getGlobalSearchResults(searchData, "rct");
    const collectionResults = getGlobalSearchResults(searchData, "ptn");

    expect(itemResults.items.map((item) => item.id)).toEqual(["item-1"]);
    expect(collectionResults.collections.map((collection) => collection.id)).toEqual([
      "collection-1",
    ]);
  });

  it("does not fuzzy match a normal word across unrelated words", () => {
    const results = getGlobalSearchResults(searchData, "test");

    expect(results.items).toEqual([]);
    expect(results.collections).toEqual([]);
  });
});
