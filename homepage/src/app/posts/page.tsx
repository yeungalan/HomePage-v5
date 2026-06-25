import type { Metadata } from 'next';
import { RealFooter } from '@/components/FooterLinks';
import { PostsList } from '@/components/PostList';
import { getPosts } from '@/lib/posts';
import { SITE_CONFIG } from '@/constants/site';

export const metadata: Metadata = {
  title: 'Posts',
  description: `Articles and notes by ${SITE_CONFIG.author.name} on living and studying in Japan, cloud security, software engineering and more.`,
  alternates: { canonical: '/posts' },
  openGraph: {
    title: 'Posts',
    description: `Articles and notes by ${SITE_CONFIG.author.name} on living and studying in Japan, cloud security, software engineering and more.`,
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
