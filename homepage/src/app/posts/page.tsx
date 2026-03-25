import { RealFooter } from '@/components/FooterLinks';
import { PostsList } from '@/components/PostList';
import { getPosts } from '@/lib/posts';

export const dynamic = 'force-dynamic';

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
