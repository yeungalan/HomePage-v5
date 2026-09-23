import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { RealFooter } from '@/components/FooterLinks';
import { TagPostsList } from '@/components/TagPostsList';
import { getAllTags, getPostsByTag } from '@/lib/posts';
import { tagFromSlug, tagHref } from '@/lib/tags';
import { SITE_CONFIG } from '@/constants/site';

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((tag) => ({ slug: tag }));
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tag = tagFromSlug(slug);
  const posts = await getPostsByTag(tag);

  if (posts.length === 0) {
    return { title: 'Tag Not Found' };
  }

  const title = `#${tag}`;
  const description = `Posts by ${SITE_CONFIG.author.name} tagged "${tag}".`;
  return {
    title,
    description,
    alternates: { canonical: tagHref(tag) },
    openGraph: { title, description, url: tagHref(tag) },
  };
}

export default async function TagPage({ params }: PageProps) {
  const { slug } = await params;
  const tag = tagFromSlug(slug);
  const posts = await getPostsByTag(tag);

  if (posts.length === 0) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <TagPostsList tag={tag} posts={posts} />
      </main>
      <RealFooter />
    </div>
  );
}
