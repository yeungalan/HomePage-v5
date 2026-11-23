/**
 * Markdown versions of the site's pages, for AI agents and other clients that
 * send `Accept: text/markdown`.
 *
 * next.config.ts rewrites those requests to the route handlers under
 * `src/app/md/`, which build each page with the helpers in this folder from the
 * same data the HTML page renders. Each document is YAML front matter, the page
 * content, and the site's navigation and footer. UI text is the English
 * (default) catalogue, as the pre-rendered HTML shows it; posts keep their own
 * language.
 */

import { SITE_CONFIG } from '@/constants/site';
import { JST_OFFSET_MS } from '@/constants/timezones';
import { FOOTER_CONFIG } from '@/data/footer';
import { HEADER_MENU_CONFIG } from '@/data/navigation';
import { DEFAULT_LOCALE } from '@/i18n/config';
import { translate, type TranslateVars } from '@/i18n/translate';

/** A UI string in English, the language the pre-rendered HTML pages use. */
export const t = (key: string, vars?: TranslateVars): string => translate(DEFAULT_LOCALE, key, vars);

type FrontMatterValue = string | string[] | Record<string, string>;

export interface MarkdownPage {
  /**
   * Path of the HTML page this document stands for, percent-encoded
   * (`/tags/NEC%20Mate`). It becomes the `url` field and the canonical link.
   * Left out for the 404 page.
   */
  path?: string;
  title: string;
  /** BCP-47 language of the content; English unless given. */
  language?: string;
  /** More front matter fields, in order. Empty values are left out. */
  meta?: Record<string, FrontMatterValue | undefined>;
  /** The page content, starting with its `# Heading`. */
  body: string;
}

/** Absolute URL for a site path; absolute URLs pass through, as does anything unparsable. */
export const absoluteUrl = (href: string): string => {
  try {
    return new URL(href, SITE_CONFIG.url).toString();
  } catch {
    return href;
  }
};

/** `[text](url)`, escaped so neither the text nor the URL can end the link early. */
export const link = (text: string, href: string): string => {
  const label = text.replace(/\s+/g, ' ').trim().replace(/[\\[\]]/g, '\\$&');
  const url = absoluteUrl(href).replace(/\(/g, '%28').replace(/\)/g, '%29');
  return `[${label}](${url})`;
};

export const bulletList = (items: string[]): string => items.map((item) => `- ${item}`).join('\n');

/** A GFM table. Pipes in cells are escaped and line breaks folded into spaces. */
export const table = (header: string[], rows: string[][]): string => {
  const row = (cells: string[]) =>
    `| ${cells.map((cell) => cell.replace(/\s+/g, ' ').trim().replace(/\|/g, '\\|')).join(' | ')} |`;
  return [row(header), row(header.map(() => '---')), ...rows.map(row)].join('\n');
};

/** The date part of `2026-09-28T00:00:00Z` or `2026-09-27 00:00:00`. */
export const isoDate = (value: string): string => /^\d{4}-\d{2}-\d{2}/.exec(value)?.[0] ?? value;

/** `2026-11-23 08:15 UTC` */
export const utcMinute = (date: Date): string => `${date.toISOString().slice(0, 16).replace('T', ' ')} UTC`;

/** Front matter values are JSON strings, which YAML reads as double-quoted scalars. */
const frontMatter = (fields: Record<string, FrontMatterValue | undefined>): string => {
  const lines = ['---'];
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined) continue;
    if (typeof value === 'string') {
      if (value) lines.push(`${key}: ${JSON.stringify(value)}`);
    } else if (Array.isArray(value)) {
      if (value.length) lines.push(`${key}: [${value.map((item) => JSON.stringify(item)).join(', ')}]`);
    } else {
      const entries = Object.entries(value);
      if (entries.length) {
        lines.push(`${key}:`);
        for (const [name, item] of entries) lines.push(`  ${name}: ${JSON.stringify(item)}`);
      }
    }
  }
  lines.push('---');
  return lines.join('\n');
};

/**
 * The year of the build in Japan time, which the HTML footer's copyright line
 * ends with (see `COPYRIGHT_YEAR` in components/FooterLinks.tsx).
 */
const copyrightYear = (): string => {
  const built = new Date(process.env.NEXT_PUBLIC_BUILD_DATE ?? '');
  if (Number.isNaN(built.getTime())) return SITE_CONFIG.buildDateFallback.slice(0, 4);
  return String(new Date(built.getTime() + JST_OFFSET_MS).getUTCFullYear());
};

/** The header menu, the footer's link sections and its copyright line. */
const siteFooter = (): string => {
  const menu = HEADER_MENU_CONFIG.flatMap((item) => item.subMenu ?? [item]).map((item) =>
    link(item.titleKey ? t(item.titleKey) : item.title, item.path),
  );
  const sections = FOOTER_CONFIG.linkSections.map((section) => {
    const links = section.links
      .filter((item) => !item.locales || item.locales.includes(DEFAULT_LOCALE))
      .map((item) => link(item.nameKey ? t(item.nameKey) : item.name, item.href));
    return `${t(section.nameKey)}: ${links.join(' · ')}`;
  });
  const years = FOOTER_CONFIG.otherInfo.date.replace('{{now}}', copyrightYear());
  return [
    menu.join(' · '),
    ...sections,
    `© ${years} ${t('footer.copyright')}. ${t('footer.poweredBy')}`,
  ].join('\n\n');
};

/** The whole document: front matter, the page content, then the site footer. */
export const renderMarkdown = (page: MarkdownPage): string =>
  [
    frontMatter({
      title: page.title,
      url: page.path && absoluteUrl(page.path),
      language: page.language ?? 'en',
      ...page.meta,
    }),
    page.body.trim(),
    '---',
    siteFooter(),
  ].join('\n\n') + '\n';

/**
 * The HTTP response for a page. `Vary: Accept` keeps caches from handing the
 * Markdown to browsers, which ask for HTML at the same URL.
 */
export const markdownResponse = (page: MarkdownPage, status = 200): Response => {
  const headers = new Headers({
    'Content-Type': 'text/markdown; charset=utf-8',
    Vary: 'Accept',
  });
  if (page.path) headers.set('Link', `<${absoluteUrl(page.path)}>; rel="canonical"`);
  return new Response(renderMarkdown(page), { status, headers });
};
