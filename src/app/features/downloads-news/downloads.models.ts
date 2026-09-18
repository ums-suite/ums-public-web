import type { DownloadResourceDto } from '../../core/http/content-api.models';

export interface DownloadCategoryGroup {
  readonly category: string;
  readonly items: readonly DownloadResourceDto[];
}

/**
 * PWEB-22: "grouped by category, not a flat list" (requirement-spec.md §3.6) -- `category` is a
 * real, server-populated string field on `DownloadResourceDto` (confirmed against source,
 * `content-api.models.ts`'s doc comment), so this groups genuinely real data rather than
 * fabricating a taxonomy. Groups are sorted alphabetically by category name for a stable,
 * predictable layout; items within a group keep the server's own return order.
 */
export function groupDownloadsByCategory(
  items: readonly DownloadResourceDto[],
): readonly DownloadCategoryGroup[] {
  const byCategory = new Map<string, DownloadResourceDto[]>();

  for (const item of items) {
    const bucket = byCategory.get(item.category);
    if (bucket) {
      bucket.push(item);
    } else {
      byCategory.set(item.category, [item]);
    }
  }

  return Array.from(byCategory.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, groupItems]) => ({ category, items: groupItems }));
}
