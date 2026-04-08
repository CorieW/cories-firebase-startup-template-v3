/**
 * Tests admin pagination helpers.
 */
import { describe, expect, it } from "vitest";
import {
  ADMIN_DIRECTORY_PAGE_SIZE,
  getPaginationOffset,
  getPaginationSummary,
  normalizePaginationPage,
  paginateItems,
} from "@/lib/pagination";

describe("admin pagination helpers", () => {
  it("normalizes invalid page values back to page one", () => {
    expect(normalizePaginationPage(undefined)).toBe(1);
    expect(normalizePaginationPage("0")).toBe(1);
    expect(normalizePaginationPage("-4")).toBe(1);
    expect(normalizePaginationPage("hello")).toBe(1);
    expect(normalizePaginationPage("3")).toBe(3);
  });

  it("calculates offsets and slices lists into page windows", () => {
    const items = Array.from(
      { length: ADMIN_DIRECTORY_PAGE_SIZE + 4 },
      (_, index) => {
        return `item-${index + 1}`;
      },
    );

    expect(getPaginationOffset(2, ADMIN_DIRECTORY_PAGE_SIZE)).toBe(
      ADMIN_DIRECTORY_PAGE_SIZE,
    );

    expect(paginateItems(items, 1, ADMIN_DIRECTORY_PAGE_SIZE)).toEqual({
      hasNextPage: true,
      items: items.slice(0, ADMIN_DIRECTORY_PAGE_SIZE),
      page: 1,
      pageSize: ADMIN_DIRECTORY_PAGE_SIZE,
      totalCount: items.length,
    });

    expect(paginateItems(items, 2, ADMIN_DIRECTORY_PAGE_SIZE)).toEqual({
      hasNextPage: false,
      items: items.slice(ADMIN_DIRECTORY_PAGE_SIZE),
      page: 2,
      pageSize: ADMIN_DIRECTORY_PAGE_SIZE,
      totalCount: items.length,
    });
  });

  it("builds a visible item range for the current page", () => {
    expect(
      getPaginationSummary({
        itemCount: 25,
        page: 2,
        pageSize: 25,
      }),
    ).toEqual({
      endItem: 50,
      startItem: 26,
    });

    expect(
      getPaginationSummary({
        itemCount: 0,
        page: 1,
        pageSize: 25,
      }),
    ).toBeNull();
  });
});
