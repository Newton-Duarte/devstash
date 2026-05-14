import { describe, expect, it } from "vitest";

import { updateItemSchema } from "@/lib/items/update-item-schema";

describe("updateItemSchema", () => {
  it("trims editable text fields and tags", () => {
    const result = updateItemSchema.safeParse({
      title: "  React Hook  ",
      description: "  Useful pattern  ",
      content: "  const value = true;  ",
      language: "  ts  ",
      url: null,
      tags: [" react ", " hooks "],
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data).toEqual({
        title: "React Hook",
        description: "Useful pattern",
        content: "const value = true;",
        language: "ts",
        url: null,
        tags: ["react", "hooks"],
        collectionIds: [],
      });
    }
  });

  it("defaults omitted tags to an empty array", () => {
    const result = updateItemSchema.safeParse({
      title: "Link",
      url: "https://example.com",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.tags).toEqual([]);
    }
  });

  it("trims collection ids", () => {
    const result = updateItemSchema.safeParse({
      title: "Link",
      collectionIds: [" collection-1 ", " collection-2 "],
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.collectionIds).toEqual(["collection-1", "collection-2"]);
    }
  });

  it("rejects an empty title", () => {
    const result = updateItemSchema.safeParse({
      title: "   ",
      tags: [],
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid URLs", () => {
    const result = updateItemSchema.safeParse({
      title: "Bad link",
      url: "not-a-url",
      tags: [],
    });

    expect(result.success).toBe(false);
  });

  it("rejects empty tag names after trimming", () => {
    const result = updateItemSchema.safeParse({
      title: "Snippet",
      tags: ["react", "   "],
    });

    expect(result.success).toBe(false);
  });
});
