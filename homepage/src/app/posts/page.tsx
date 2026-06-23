import type { Metadata } from 'next';
import { RealFooter } from '@/components/FooterLinks';
import { PostsList } from '@/components/PostList';
import { getPosts } from '@/lib/posts';

export const metadata: Metadata = {
  title: 'Posts',
  description:
    'Articles and notes by Alan Yeung on living and studying in Japan, cloud security, software engineering and more.',
  alternates: { canonical: '/posts' },
  openGraph: {
    title: 'Posts',
    description:
      'Articles and notes by Alan Yeung on living and studying in Japan, cloud security, software engineering and more.',
    url: '/posts',
  },
};

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <PostsList posts={posts} />
      </main>
      <RealFooter />
    </div>
  );
}
