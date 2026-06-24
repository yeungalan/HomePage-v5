'use client';

import { motion } from 'motion/react';
import Link from 'next/link';

import { RelativeTime } from '@/components/RelativeTime';
import { useTranslation } from '@/i18n';
import { NormalContainer } from './NormalContainer';
import { staggerListVariants } from '@/constants/motion';

interface Post {
  id: string;
  title: string;
  slug: string;
  created: string;
  availableLanguages: string[];
  allTitles: Record<string, string>;
}

interface PostsListProps {
  posts: Post[];
}

const getCombinedTitle = (post: Post): string => {
  const { allTitles, availableLanguages } = post;
  if (availableLanguages.length === 1) return post.title;

  const titles: string[] = [];
  if (allTitles.default) titles.push(allTitles.default);
  for (const lang of availableLanguages) {
    if (lang !== 'default' && allTitles[lang]) titles.push(allTitles[lang]);
  }
  return titles.join(' / ');
};


export const PostsList: React.FC<PostsListProps> = ({ posts }) => {
  const t = useTranslation();
  return (
  <div className="relative w-full overflow-hidden">
    <NormalContainer>
      <header className="pt-5 mb-10">
        <h1 className="text-3xl font-bold mb-4 dark:text-white">{t('posts.title')}</h1>
        <h3 className="text-xl text-gray-600 dark:text-gray-300">{t('posts.subtitle')}</h3>
      </header>
      <motion.ul
        className="shiro-timeline mt-4"
        variants={staggerListVariants}
        initial="hidden"
        animate="show"
      >
        {posts.map((post) => (
          <li key={post.id} className="flex min-w-0 justify-between">
            <Link
              prefetch
              className="min-w-0 shrink truncate dark:text-white"
              href={`/posts/${post.slug}`}
            >
              {getCombinedTitle(post)}
            </Link>
            <span className="ml-2 shrink-0 self-end text-xs opacity-70 dark:text-white">
              <RelativeTime date={post.created} displayAbsoluteTimeAfterDay={180} />
            </span>
          </li>
        ))}
      </motion.ul>
    </NormalContainer>
  </div>
  );
};
