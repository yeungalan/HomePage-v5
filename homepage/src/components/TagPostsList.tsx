'use client';

import { useTranslation } from '@/i18n';
import { PostsList } from './PostList';

type PostsListPosts = React.ComponentProps<typeof PostsList>['posts'];

interface TagPostsListProps {
  tag: string;
  posts: PostsListPosts;
}

export const TagPostsList: React.FC<TagPostsListProps> = ({ tag, posts }) => {
  const t = useTranslation();
  return (
    <PostsList
      posts={posts}
      title={`#${tag}`}
      subtitle={t('tags.subtitle', { count: posts.length })}
    />
  );
};
