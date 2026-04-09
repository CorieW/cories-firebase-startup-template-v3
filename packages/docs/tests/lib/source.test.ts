// @vitest-environment node

/**
 * Integration tests for the docs content source and search indexing.
 */
import { describe, expect, it } from "vitest";
import { docsSearchHandler, loadDocsPageData, source } from "@/lib/source.server";

describe("docs source", () => {
  it("loads seeded pages and preserves slug-based lookup", async () => {
    const homePage = source.getPage([]);
    const richContentPage = source.getPage(["reference", "rich-content"]);

    expect(homePage?.data.title).toBe("Welcome");
    expect(richContentPage?.data.title).toBe("Rich Content Examples");

    const loadedPage = await loadDocsPageData(["reference", "rich-content"]);

    expect(loadedPage.path).toContain("reference/rich-content");
    expect(loadedPage.toc.length).toBeGreaterThan(0);
  });

  it("serializes toc entries with their real heading titles", async () => {
    const loadedPage = await loadDocsPageData([]);

    expect(loadedPage.toc.map((item) => item.title)).toEqual(
      expect.arrayContaining([
        "Build with the template, not around it",
        "What this package supports",
        "Why this setup works",
      ]),
    );
    expect(loadedPage.toc.every((item) => item.title === "Welcome")).toBe(false);
  });

  it("builds a page tree and searchable results from the seeded docs", async () => {
    const tree = source.getPageTree();
    const results = await docsSearchHandler.search("Rich Content");

    expect(tree.children.length).toBeGreaterThan(0);
    expect(results.some((result) => result.id === "/reference/rich-content")).toBe(
      true,
    );
  });
});
