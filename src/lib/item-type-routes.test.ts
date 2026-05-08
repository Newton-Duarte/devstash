import { describe, expect, it } from "vitest";

import {
  getItemTypeNameFromRouteSegment,
  getItemTypePluralLabel,
  getItemTypeRouteSegment,
  ITEM_TYPE_DISPLAY_ORDER,
} from "@/lib/item-type-routes";

describe("item type routes", () => {
  it("uses configured route segments for system item types", () => {
    expect(getItemTypeRouteSegment("snippet")).toBe("snippets");
    expect(getItemTypeRouteSegment("image")).toBe("images");
  });

  it("falls back to a simple pluralized route segment for unknown types", () => {
    expect(getItemTypeRouteSegment("workflow")).toBe("workflows");
  });

  it("maps route segments back to item type names when known", () => {
    expect(getItemTypeNameFromRouteSegment("commands")).toBe("command");
    expect(getItemTypeNameFromRouteSegment("workflows")).toBeNull();
  });

  it("builds plural labels from the route segment", () => {
    expect(getItemTypePluralLabel("prompt")).toBe("Prompts");
    expect(getItemTypePluralLabel("workflow")).toBe("Workflows");
  });

  it("keeps the display order aligned with the configured system types", () => {
    expect(ITEM_TYPE_DISPLAY_ORDER).toEqual([
      "snippet",
      "prompt",
      "command",
      "note",
      "file",
      "image",
      "link",
    ]);
  });
});
