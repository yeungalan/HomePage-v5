'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import * as React from 'react';
import Fuse from 'fuse.js';

import { RelativeTime } from '@/components/RelativeTime';
import { NormalContainer } from './NormalContainer';

interface Post {
  id: string;
  title: string;
  slug: string;
  created: string;
  availableLanguages: string[];
  allTitles: Record<string, string>;
  content: string;
}

interface PostsListProps {
  posts: Post[];
}

// Helper function to format combined titles
const getCombinedTitle = (post: Post): string => {
  const { allTitles, availableLanguages } = post;

  // If only one language, just return the title
  if (availableLanguages.length === 1) {
    return post.title;
  }

  // Build combined title with all language versions
  const titles: string[] = [];

  // Add default language title first if it exists
  if (allTitles.default) {
    titles.push(allTitles.default);
  }

  // Add other language titles
  for (const lang of availableLanguages) {
    if (lang !== 'default' && allTitles[lang]) {
      titles.push(allTitles[lang]);
    }
  }

  return titles.join(' / ');
};

export const PostsList: React.FC<PostsListProps> = ({ posts }) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  // Configure Fuse.js for searching
  const fuse = React.useMemo(
    () =>
      new Fuse(posts, {
        keys: [
          { name: 'title', weight: 2 },
          { name: 'allTitles.default', weight: 2 },
          { name: 'allTitles.en', weight: 2 },
          { name: 'allTitles.zh', weight: 2 },
          { name: 'content', weight: 1 },
        ],
        threshold: 0.3,
        includeScore: true,
        ignoreLocation: true,
      }),
    [posts]
  );

  // Filter posts based on search query
  const filteredPosts = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return posts;
    }
    const results = fuse.search(searchQuery);
    return results.map((result) => result.item);
  }, [searchQuery, fuse, posts]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <div className="relative w-full overflow-hidden">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
        <NormalContainer>
          <header className="pt-5 mb-10">
            <h1 className="text-3xl font-bold mb-4 dark:text-white">Posts</h1>
            <h3 className="text-xl text-gray-600 dark:text-gray-300">Post Links</h3>
          </header>

          <div className="mb-6">
            <input
              type="text"
              placeholder="Search posts by title or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>

          {filteredPosts.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No posts found matching &quot;{searchQuery}&quot;
            </p>
          ) : (
            <motion.ul
              className="shiro-timeline mt-4"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {filteredPosts.map((post) => {
                return (
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
                );
              })}
            </motion.ul>
          )}
        </NormalContainer>
      </motion.div>
    </div>
  );
};
