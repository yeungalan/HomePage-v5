/** URL path for a tag's listing page. Safe to import from client components. */
export function tagHref(tag: string): string {
  return `/tags/${encodeURIComponent(tag)}`;
}

/**
 * Recover the tag from a `/tags/[slug]` route param. Next may hand over the
 * segment still percent-encoded (non-ASCII tags), so decode defensively.
 */
export function tagFromSlug(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}
