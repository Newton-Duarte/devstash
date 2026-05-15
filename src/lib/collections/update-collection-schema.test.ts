import { describe, expect, it } from "vitest";

import { updateCollectionSchema } from "@/lib/collections/update-collection-schema";

describe("updateCollectionSchema", () => {
  it("trims collection metadata", () => {
    const result = updateCollectionSchema.safeParse({
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

  it("rejects an empty name", () => {
    const result = updateCollectionSchema.safeParse({
      name: "   ",
      description: "Notes",
    });

    expect(result.success).toBe(false);
  });
});
