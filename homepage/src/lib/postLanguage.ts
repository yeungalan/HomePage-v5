/**
 * Client-safe helpers for choosing which language variant of a post to show.
 *
 * Each post may exist as several Markdown files: `slug.md` (the primary
 * version, whose language is set by `PRIMARY_LANGUAGE=` in its AUTOMATE
 * FIELD) plus translations such as `slug_en.md` / `slug_ja.md`.
 */

/** Language assumed when a post does not declare `PRIMARY_LANGUAGE`. */
export const DEFAULT_PRIMARY_LANGUAGE = 'zh';

export interface LocalizablePost {
  slug: string;
  baseSlug: string;
  title: string;
  primaryLanguage: string;
  availableLanguages: string[];
  allTitles: Record<string, string>;
}

/** Reduce a BCP-47 tag or site locale (`zh-HK`, `ja-JP`, `en`) to its base code. */
export const baseLanguage = (tag: string): string => tag.split('-')[0].toLowerCase();

/**
 * Pick the variant key (`'default'` or a language code) to show for a reader
 * whose language is `lang`. Falls back to the primary (native) version when
 * the post has no translation in that language.
 */
export const resolvePostVariant = (post: LocalizablePost, lang: string): string => {
  const base = baseLanguage(lang);
  if (base === post.primaryLanguage) return 'default';
  if (post.availableLanguages.includes(base)) return base;
  return 'default';
};

/** Title and link for the variant of `post` matching the reader's language. */
export const localizePost = (
  post: LocalizablePost,
  lang: string | null,
): { title: string; href: string } => {
  const variant = lang ? resolvePostVariant(post, lang) : 'default';
  const title = post.allTitles[variant] ?? post.allTitles.default ?? post.title;
  const href =
    variant === 'default' ? `/posts/${post.baseSlug}` : `/posts/${post.baseSlug}_${variant}`;
  return { title, href };
};
