'use client';

import { motion } from 'motion/react';
import Link from 'next/link';

import { RelativeTime } from '@/components/RelativeTime';
import { isLocale, useI18n } from '@/i18n';
import { LOCALE_STORAGE_KEY } from '@/i18n/config';
import { localizePost, type LocalizablePost } from '@/lib/postLanguage';
import { NormalContainer } from './NormalContainer';
import { staggerListVariants } from '@/constants/motion';

type Post = LocalizablePost & {
  id: string;
  created: string;
};

interface PostsListProps {
  posts: Post[];
  /** Overrides the default "Posts" heading (e.g. on a tag page). */
  title?: string;
  subtitle?: string;
}

/**
 * The reader's language: the site language they picked in the footer, else the
 * browser's own preference (not the site's English fallback, so e.g. a French
 * browser gets each post's native version). Client-only: call after mount.
 */
const readerLanguage = (siteLocale: string): string => {
  try {
    if (isLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY))) return siteLocale;
  } catch {
    // localStorage may be unavailable; fall back to the browser language.
  }
  return navigator.languages?.[0] ?? navigator.language ?? siteLocale;
};

export const PostsList: React.FC<PostsListProps> = ({ posts, title, subtitle }) => {
  const { t, locale, ready } = useI18n();
  // Until the reader's language is known (SSR / first render), show each
  // post's primary version so server and client markup match.
  const lang = ready ? readerLanguage(locale) : null;
  return (
  <div className="relative w-full overflow-hidden">
    <NormalContainer>
      <header className="pt-5 mb-10">
        <h1 className="text-3xl font-bold mb-4 dark:text-white">{title ?? t('posts.title')}</h1>
        <h3 className="text-xl text-gray-600 dark:text-gray-300">{subtitle ?? t('posts.subtitle')}</h3>
      </header>
      <motion.ul
        className="shiro-timeline shiro-timeline--posts mt-4"
        variants={staggerListVariants}
        initial="hidden"
        animate="show"
      >
        {posts.map((post) => {
          const { title: postTitle, href } = localizePost(post, lang);
          return (
          <li key={post.id} data-cy="post-item" className="flex min-w-0 justify-between">
            <Link
              prefetch
              className="min-w-0 shrink truncate dark:text-white"
              href={href}
            >
              {postTitle}
            </Link>
            <span className="ml-2 shrink-0 self-end text-xs opacity-70 dark:text-white">
              <RelativeTime date={post.created} displayAbsoluteTimeAfterDay={180} />
            </span>
          </li>
          );
        })}
      </motion.ul>
    </NormalContainer>
  </div>
  );
};
