import { describe, expect, it } from "vitest";

import { createItemSchema } from "@/lib/items/create-item-schema";

describe("createItemSchema", () => {
  it("trims shared fields and tags", () => {
    const result = createItemSchema.safeParse({
      type: "snippet",
      title: "  React Hook  ",
      description: "  Useful pattern  ",
      content: "  const value = true;  ",
      language: "  ts  ",
      tags: [" react ", " hooks "],
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data).toEqual({
        type: "snippet",
        title: "React Hook",
        description: "Useful pattern",
        content: "const value = true;",
        language: "ts",
        tags: ["react", "hooks"],
        collectionIds: [],
      });
    }
  });

  it("defaults omitted tags to an empty array", () => {
    const result = createItemSchema.safeParse({
      type: "note",
      title: "Release checklist",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.tags).toEqual([]);
    }
  });

  it("trims collection ids", () => {
    const result = createItemSchema.safeParse({
      type: "note",
      title: "Release checklist",
      collectionIds: [" collection-1 ", " collection-2 "],
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.collectionIds).toEqual(["collection-1", "collection-2"]);
    }
  });

  it("rejects an empty title", () => {
    const result = createItemSchema.safeParse({
      type: "prompt",
      title: "   ",
      tags: [],
    });

    expect(result.success).toBe(false);
  });

  it("requires a valid URL for links", () => {
    const result = createItemSchema.safeParse({
      type: "link",
      title: "Docs",
      url: "not-a-url",
      tags: [],
    });

    expect(result.success).toBe(false);
  });

  it("allows text items without a URL", () => {
    const result = createItemSchema.safeParse({
      type: "command",
      title: "List files",
      content: "ls -la",
      language: "bash",
      tags: [],
    });

    expect(result.success).toBe(true);
  });

  it("requires uploaded file metadata for file items", () => {
    const result = createItemSchema.safeParse({
      type: "file",
      title: "Archive",
      tags: [],
    });

    expect(result.success).toBe(false);
  });

  it("accepts uploaded image metadata", () => {
    const result = createItemSchema.safeParse({
      type: "image",
      title: "Architecture diagram",
      file: {
        fileKey: "user/image/example.png",
        fileName: "example.png",
        fileSize: 1024,
        fileMimeType: "image/png",
        fileUrl: null,
      },
      tags: [],
    });

    expect(result.success).toBe(true);
  });
});
