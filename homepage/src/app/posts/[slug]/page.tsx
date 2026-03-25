import { notFound } from 'next/navigation';
import { RealFooter } from '@/components/FooterLinks';
import Post from '@/components/Post';
import { getPostBySlug, parseSlugLanguage } from '@/lib/posts';

// Force dynamic rendering (SSR)
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;

  // Fetch post with metadata and available languages
  const post = await getPostBySlug(slug);

  // If post doesn't exist, return 404
  if (!post) {
    notFound();
  }

  // Parse language from slug
  const { baseSlug, language: currentLanguage } = parseSlugLanguage(slug);

  return (
    <div className="relative">
      <Post
        markdownContent={post.content}
        baseSlug={baseSlug}
        currentLanguage={currentLanguage}
        availableLanguages={post.availableLanguages}
      />
      <RealFooter />
    </div>
  );
}
