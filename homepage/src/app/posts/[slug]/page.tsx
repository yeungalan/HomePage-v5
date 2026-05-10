import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: 'Post Not Found' };
  }

  return {
    title: post.title,
    description: post.description || post.title,
    keywords: post.tags.length > 0 ? post.tags : undefined,
    openGraph: {
      title: post.title,
      description: post.description || post.title,
      type: 'article',
      publishedTime: post.created,
      tags: post.tags.length > 0 ? post.tags : undefined,
    },
  };
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
