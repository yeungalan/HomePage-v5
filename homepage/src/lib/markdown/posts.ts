/**
 * Markdown for the post list (/posts), single posts (/posts/[slug]) and tag
 * pages (/tags/[slug]). A post is served as written, after the cleanup in
 * `postBody`, with its AUTOMATE FIELD block turned into front matter.
 */

import { parseMarkdownWithMetadata } from '@/components/Post/utils/markdownParser';
import { SITE_CONFIG } from '@/constants/site';
import { getPostBySlug, getPosts, getPostsByTag, type Post } from '@/lib/posts';
import { tagFromSlug, tagHref } from '@/lib/tags';
import { absoluteUrl, isoDate, link, t, type MarkdownPage } from './document';

/** Slug of one language variant; `'default'` is the unsuffixed primary file. */
const variantSlug = (baseSlug: string, variant: string) =>
  variant === 'default' ? baseSlug : `${baseSlug}_${variant}`;

const variantPath = (baseSlug: string, variant: string) => `/posts/${variantSlug(baseSlug, variant)}`;

/** Language code of a variant: the post's primary language for the unsuffixed file. */
const variantLanguage = (post: Post, variant: string) =>
  variant === 'default' ? post.primaryLanguage : variant;

/** The primary version first, then the translations by language code. */
const variantsOf = (post: Post) =>
  [...post.availableLanguages].sort((a, b) =>
    a === 'default' ? -1 : b === 'default' ? 1 : a.localeCompare(b),
  );

const LANGUAGE_NAMES = new Intl.DisplayNames(['en'], { type: 'language' });

/** `ja` → `Japanese` */
const languageName = (code: string) => {
  try {
    return LANGUAGE_NAMES.of(code) ?? code;
  } catch {
    return code; // not a valid language code
  }
};

/** Newest first, one entry per post, with its translations nested under it. */
const postList = (posts: Post[]): string =>
  posts
    .map((post) => {
      const title = (variant: string) => post.allTitles[variant] ?? post.title;
      const [primary, ...translations] = variantsOf(post);
      return [
        `- ${isoDate(post.created)} · ${link(title(primary), variantPath(post.baseSlug, primary))}`,
        ...translations.map(
          (variant) =>
            `  - ${languageName(variantLanguage(post, variant))}: ${link(title(variant), variantPath(post.baseSlug, variant))}`,
        ),
      ].join('\n');
    })
    .join('\n');

export async function postsMarkdown(): Promise<MarkdownPage> {
  return {
    path: '/posts',
    title: t('posts.title'),
    body: [`# ${t('posts.title')}`, t('posts.subtitle'), postList(await getPosts())].join('\n\n'),
  };
}

/** The posts tagged `slug` (a `/tags/[slug]` route param), or null for an unknown tag. */
export async function tagMarkdown(slug: string): Promise<MarkdownPage | null> {
  const tag = tagFromSlug(slug);
  const posts = await getPostsByTag(tag);
  if (posts.length === 0) return null;
  return {
    path: tagHref(tag),
    title: `#${tag}`,
    body: [`# #${tag}`, t('tags.subtitle', { count: posts.length }), postList(posts)].join('\n\n'),
  };
}

/** Prose and fenced code blocks (``` or ~~~), in order, so the cleanup can skip code. */
const splitCodeFences = (markdown: string) => {
  const runs: { text: string; code: boolean }[] = [];
  let lines: string[] = [];
  let fence: string | null = null;
  const flush = (code: boolean) => {
    if (lines.length) runs.push({ text: lines.join('\n'), code });
    lines = [];
  };
  for (const line of markdown.split('\n')) {
    const marker = /^\s*(`{3,}|~{3,})/.exec(line)?.[1];
    if (fence === null) {
      if (marker) {
        flush(false);
        fence = marker;
      }
      lines.push(line);
    } else {
      lines.push(line);
      if (marker && marker[0] === fence[0] && marker.length >= fence.length && line.trim() === marker) {
        flush(true);
        fence = null;
      }
    }
  }
  flush(fence !== null);
  return runs;
};

/** `<span data-icon="mingcute:…"></span>`, the posts' stand-in for emoji (see CLAUDE.md). */
const ICON_SPAN = /[ \t]*<span\s+data-icon="[^"]*"\s*>\s*<\/span>[ \t]*/g;
const IFRAME = /<iframe\b([^>]*)>[\s\S]*?<\/iframe>/gi;

const attribute = (attributes: string, name: string) =>
  new RegExp(`(?:^|\\s)${name}\\s*=\\s*"([^"]*)"`, 'i').exec(attributes)?.[1].replace(/&amp;/g, '&');

/** Link text for an embed without a title: the posts embed Google Maps this way. */
const embedLabel = (src: string) => {
  try {
    const { hostname, pathname } = new URL(src, SITE_CONFIG.url);
    if (/(^|\.)google\.[a-z.]+$/.test(hostname) && pathname.startsWith('/maps')) return 'Map';
    return `Embedded content from ${hostname}`;
  } catch {
    return 'Embedded content';
  }
};

const cleanUpProse = (text: string) =>
  text
    // Embedded maps and videos become links to them.
    .replace(IFRAME, (_match, attributes: string) => {
      const src = attribute(attributes, 'src');
      return src ? link(attribute(attributes, 'title') || embedLabel(src), src) : '';
    })
    // Icons are decoration. Keep one space where one stood between words.
    .replace(ICON_SPAN, (match, offset: number, whole: string) => {
      const before = whole[offset - 1];
      const after = whole[offset + match.length];
      return before && before !== '\n' && after && after !== '\n' ? ' ' : '';
    })
    // Site-relative links and images, so they still resolve outside the site.
    .replace(/\]\(\s*\/(?!\/)/g, `](${SITE_CONFIG.url}/`)
    .replace(/(\s(?:src|href)\s*=\s*["'])\/(?!\/)/gi, `$1${SITE_CONFIG.url}/`);

/** A post's Markdown, cleaned up for reading outside the site. Code blocks are left as they are. */
const postBody = (markdown: string) =>
  splitCodeFences(markdown)
    .map((run) => (run.code ? run.text : cleanUpProse(run.text)))
    .join('\n');

/** One language variant of a post (`cissp`, `cissp_en`), or null if there is no such post. */
export async function postMarkdown(slug: string): Promise<MarkdownPage | null> {
  const posts = await getPosts();
  // Only open files that are posts, so a slug like `..%2Fsomething` can't reach other files.
  const index = posts.findIndex((p) => p.availableLanguages.some((v) => variantSlug(p.baseSlug, v) === slug));
  const post = index === -1 ? null : await getPostBySlug(slug);
  if (!post) return null;

  const { metadata, markdown } = parseMarkdownWithMetadata(post.content);
  const translations = Object.fromEntries(
    variantsOf(post)
      .filter((variant) => variant !== post.language)
      .map((variant) => [variantLanguage(post, variant), absoluteUrl(variantPath(post.baseSlug, variant))]),
  );

  // The same neighbours as the arrows under the post; the list is newest first.
  const older = posts[index + 1];
  const newer = index > 0 ? posts[index - 1] : undefined;
  const neighbours: string[] = [];
  if (older) neighbours.push(`Previous: ${link(older.title, `/posts/${older.slug}`)}`);
  if (newer) neighbours.push(`Next: ${link(newer.title, `/posts/${newer.slug}`)}`);
  const related: string[] = [];
  if (post.tags.length) related.push(`Tags: ${post.tags.map((tag) => link(`#${tag}`, tagHref(tag))).join(' · ')}`);
  if (neighbours.length) related.push(neighbours.join(' · '));

  return {
    path: `/posts/${slug}`,
    title: post.title,
    language: variantLanguage(post, post.language),
    meta: {
      summary: metadata.aiSummary,
      author: SITE_CONFIG.author.name,
      published: metadata.createdDate,
      updated: metadata.editedDate,
      category: metadata.category,
      tags: post.tags,
      translations,
    },
    body: [postBody(markdown), ...(related.length ? ['---', ...related] : [])].join('\n\n'),
  };
}
