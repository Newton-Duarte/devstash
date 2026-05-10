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

  it("rejects unsupported item types", () => {
    const result = createItemSchema.safeParse({
      type: "file",
      title: "Archive",
      tags: [],
    });

    expect(result.success).toBe(false);
  });
});
