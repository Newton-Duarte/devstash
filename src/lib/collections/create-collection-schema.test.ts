import { describe, expect, it } from "vitest";

import { createCollectionSchema } from "@/lib/collections/create-collection-schema";

describe("createCollectionSchema", () => {
  it("trims collection fields", () => {
    const result = createCollectionSchema.safeParse({
      name: "  React Patterns  ",
      description: "  Hooks and component notes  ",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data).toEqual({
        name: "React Patterns",
        description: "Hooks and component notes",
      });
    }
  });

  it("allows an omitted description", () => {
    const result = createCollectionSchema.safeParse({
      name: "Commands",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an empty name", () => {
    const result = createCollectionSchema.safeParse({
      name: "   ",
      description: "Notes",
    });

    expect(result.success).toBe(false);
  });
});
