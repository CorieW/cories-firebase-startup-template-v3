/**
 * Shared path parsing helpers for docs route loaders.
 */
/**
 * Converts a TanStack splat param into the slug array expected by the content source.
 */
export function parseDocSlugs(splat: string | undefined) {
  if (!splat) {
    return [];
  }

  return splat.split("/").filter(Boolean);
}
