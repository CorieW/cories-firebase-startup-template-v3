/**
 * Server-only docs content source and search helpers.
 */
import { notFound } from "@tanstack/react-router";
import { loader } from "fumadocs-core/source";
import { lucideIconsPlugin } from "fumadocs-core/source/lucide-icons";
import { createFromSource } from "fumadocs-core/search/server";
import { docs } from "fumadocs-mdx:collections/server";
import type { LoadedDocsPage } from "./docs-types";

export const source = loader(docs.toFumadocsSource(), {
  baseUrl: "/",
  plugins: [
    lucideIconsPlugin({
      defaultIcon: "FileText",
    }),
  ],
});

export const docsSearchHandler = createFromSource(source, {
  language: "english",
});

function extractTocTitle(value: unknown): string | null {
  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value)) {
    const flattened = value
      .map((item) => extractTocTitle(item))
      .filter((item): item is string => Boolean(item))
      .join(" ")
      .trim();

    return flattened.length > 0 ? flattened : null;
  }

  if (value && typeof value === "object" && "props" in value) {
    return extractTocTitle(
      (value as { props?: { children?: unknown } }).props?.children,
    );
  }

  return null;
}

/**
 * Reads a docs page and serializes the page tree for TanStack Start route loaders.
 */
export async function loadDocsPageData(
  slugs: string[],
): Promise<LoadedDocsPage> {
  const page = source.getPage(slugs);

  if (!page) {
    throw notFound();
  }

  const toc = page.data.toc.map((item) => ({
    depth: item.depth,
    title: extractTocTitle(item.title) ?? page.data.title,
    url: item.url,
  }));

  return {
    description: page.data.description,
    pageTree: (await source.serializePageTree(source.getPageTree())) as unknown as {
      [key: string]: {};
    },
    path: page.path,
    structuredData: page.data.structuredData,
    summary: page.data.summary,
    title: page.data.title,
    toc,
  };
}
