import { describe, expect, it } from "vitest";

import { getPageNumber, getPaginationMeta, getPaginationSkip } from "@/lib/pagination";

describe("pagination utilities", () => {
  it("normalizes invalid page values to the first page", () => {
    expect(getPageNumber(undefined)).toBe(1);
    expect(getPageNumber("0")).toBe(1);
    expect(getPageNumber("abc")).toBe(1);
    expect(getPageNumber(["3", "4"])).toBe(3);
  });

  it("clamps pagination metadata to the available page range", () => {
    expect(getPaginationMeta(50, 10, 21)).toEqual({
      currentPage: 3,
      hasNextPage: false,
      hasPreviousPage: true,
      totalItems: 50,
      totalPages: 3,
    });
  });

  it("calculates the database offset for a page", () => {
    expect(getPaginationSkip(1, 21)).toBe(0);
    expect(getPaginationSkip(3, 21)).toBe(42);
  });
});
