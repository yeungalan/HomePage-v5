import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Script from 'next/script';
import { RealFooter } from '@/components/FooterLinks';
import Post from '@/components/Post';
import { getPosts, getPostBySlug, parseSlugLanguage } from '@/lib/posts';
import { SITE_CONFIG } from '@/constants/site';

/** Build the canonical URL slug for a given base slug + language variant. */
function slugForLanguage(baseSlug: string, language: string): string {
  return language === 'default' ? baseSlug : `${baseSlug}_${language}`;
}

/** Map an internal language code to a BCP-47 hreflang value. */
function hreflangFor(language: string): string {
  if (language === 'default') return 'x-default';
  return language;
}

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.flatMap((post) =>
    post.availableLanguages.map((lang) => ({
      slug: lang === 'default' ? post.baseSlug : `${post.baseSlug}_${lang}`,
    }))
  );
}

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

  const description = post.description || post.title;
  const canonicalPath = `/posts/${post.slug}`;
  const ogImage = `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`;

  // hreflang map of every available translation of this post.
  const languageAlternates = Object.fromEntries(
    post.availableLanguages.map((lang) => [
      hreflangFor(lang),
      `/posts/${slugForLanguage(post.baseSlug, lang)}`,
    ])
  );

  return {
    title: post.title,
    description,
    keywords: post.tags.length > 0 ? post.tags : undefined,
    authors: [{ name: SITE_CONFIG.author.name, url: SITE_CONFIG.url }],
    alternates: {
      canonical: canonicalPath,
      languages: Object.keys(languageAlternates).length > 1 ? languageAlternates : undefined,
    },
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      url: `${SITE_CONFIG.url}${canonicalPath}`,
      siteName: SITE_CONFIG.name,
      publishedTime: post.created,
      modifiedTime: post.created,
      authors: [SITE_CONFIG.author.name],
      tags: post.tags.length > 0 ? post.tags : undefined,
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      creator: SITE_CONFIG.author.twitter,
      images: [ogImage],
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;

  // Fetch post with metadata and available languages
  const [post, allPosts] = await Promise.all([getPostBySlug(slug), getPosts()]);

  // If post doesn't exist, return 404
  if (!post) {
    notFound();
  }

  // Parse language from slug
  const { baseSlug, language: currentLanguage } = parseSlugLanguage(slug);

  // Find adjacent posts (allPosts is sorted newest-first)
  const currentIndex = allPosts.findIndex((p) => p.baseSlug === baseSlug);
  const prevPost = currentIndex > 0
    ? { slug: allPosts[currentIndex - 1].slug, title: allPosts[currentIndex - 1].title }
    : null;
  const nextPost = currentIndex !== -1 && currentIndex < allPosts.length - 1
    ? { slug: allPosts[currentIndex + 1].slug, title: allPosts[currentIndex + 1].title }
    : null;

  const articleStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description || post.title,
    datePublished: post.created,
    dateModified: post.created,
    image: `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`,
    keywords: post.tags.length > 0 ? post.tags.join(', ') : undefined,
    url: `${SITE_CONFIG.url}/posts/${post.slug}`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_CONFIG.url}/posts/${post.slug}`,
    },
    author: {
      '@type': 'Person',
      name: SITE_CONFIG.author.name,
      url: SITE_CONFIG.url,
    },
    publisher: {
      '@type': 'Person',
      name: SITE_CONFIG.author.name,
      url: SITE_CONFIG.url,
    },
  };

  return (
    <div className="relative">
      <Script
        id={`article-structured-data-${post.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData) }}
      />
      <Post
        markdownContent={post.content}
        baseSlug={baseSlug}
        currentLanguage={currentLanguage}
        availableLanguages={post.availableLanguages}
        prevPost={prevPost}
        nextPost={nextPost}
      />
      <RealFooter />
    </div>
  );
}
