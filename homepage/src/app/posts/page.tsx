import { RealFooter } from '@/components/FooterLinks';
import { PostsList } from '@/components/PostList';
import { getPosts } from '@/lib/posts';

// Force dynamic rendering (SSR)
export const dynamic = 'force-dynamic';

export default async function PostsPage() {
  // Fetch posts on the server
  const posts = await getPosts();

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">
        <div className="pt-5">
          <main className="mt-10 flex w-full flex-col">
            <PostsList posts={posts} />
          </main>
        </div>
      </div>
      <RealFooter />
    </div>
  );
}
