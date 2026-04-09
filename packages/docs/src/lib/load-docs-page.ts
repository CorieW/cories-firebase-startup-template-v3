/**
 * Server function wrapper for loading a docs page from the content source.
 */
import { createServerFn } from "@tanstack/react-start";
import type { LoadedDocsPage } from "./docs-types";

export const loadDocsPage = createServerFn({
  method: "GET",
})
  .inputValidator((slugs: string[]) => slugs)
  .handler(async ({ data: slugs }): Promise<LoadedDocsPage> => {
    const { loadDocsPageData } = await import("./source.server");

    return loadDocsPageData(slugs);
  });
