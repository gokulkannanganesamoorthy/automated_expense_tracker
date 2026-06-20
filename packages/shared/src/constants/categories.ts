import { DEFAULT_CATEGORIES } from '../types/category';

/**
 * Re-export categories constant for convenience.
 */
export { DEFAULT_CATEGORIES } from '../types/category';

/**
 * Category ID to display name lookup.
 */
export const CATEGORY_NAMES: Record<string, string> = Object.fromEntries(
  DEFAULT_CATEGORIES.map((c) => [c.id, c.name]),
);

/**
 * Category ID to icon lookup.
 */
export const CATEGORY_ICONS: Record<string, string> = Object.fromEntries(
  DEFAULT_CATEGORIES.map((c) => [c.id, c.icon]),
);

/**
 * Category ID to color lookup.
 */
export const CATEGORY_COLORS: Record<string, string> = Object.fromEntries(
  DEFAULT_CATEGORIES.map((c) => [c.id, c.color]),
);

/**
 * Flatten all keywords to category ID for O(1) lookup.
 */
export function buildKeywordToCategoryMap(): Map<string, string> {
  const map = new Map<string, string>();
  for (const category of DEFAULT_CATEGORIES) {
    for (const keyword of category.keywords) {
      map.set(keyword.toLowerCase(), category.id);
    }
  }
  return map;
}
