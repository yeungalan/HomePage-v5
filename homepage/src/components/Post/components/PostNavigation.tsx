import Link from 'next/link';
import { Icon } from '@iconify/react';

export interface AdjacentPost {
  slug: string;
  title: string;
}

interface PostNavigationProps {
  prevPost: AdjacentPost | null;
  nextPost: AdjacentPost | null;
}

export const PostNavigation: React.FC<PostNavigationProps> = ({ prevPost, nextPost }) => {
  if (!prevPost && !nextPost) return null;

  return (
    <nav className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
      <div className="grid grid-cols-2 gap-4">
        {/* Newer post (prev in date-desc list) */}
        <div className="col-start-1">
          {prevPost ? (
            <Link
              href={`/posts/${prevPost.slug}`}
              className="group flex flex-col gap-1 p-4 rounded-xl border border-gray-200
                dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500
                hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
            >
              <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 group-hover:text-blue-500">
                <Icon icon="mdi:arrow-left" />
                Newer
              </span>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2">
                {prevPost.title}
              </span>
            </Link>
          ) : (
            <div />
          )}
        </div>

        {/* Older post (next in date-desc list) */}
        <div className="col-start-2">
          {nextPost ? (
            <Link
              href={`/posts/${nextPost.slug}`}
              className="group flex flex-col gap-1 p-4 rounded-xl border border-gray-200
                dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500
                hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors text-right"
            >
              <span className="flex items-center justify-end gap-1.5 text-xs text-gray-500 dark:text-gray-400 group-hover:text-blue-500">
                Older
                <Icon icon="mdi:arrow-right" />
              </span>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2">
                {nextPost.title}
              </span>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </nav>
  );
};
