import { notFound, redirect } from 'next/navigation';
import { RealFooter } from '@/components/FooterLinks';
import Post from '@/components/Post';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { getPostBySlug, parseSlugLanguage, getPreferredLanguage } from '@/lib/posts';
import { headers } from 'next/headers';

// Force dynamic rendering (SSR)
export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = params;

  // Fetch post with metadata and available languages
  const post = await getPostBySlug(slug);

  // If post doesn't exist, return 404
  if (!post) {
    notFound();
  }

  // Get browser language preferences from headers
  const headersList = headers();
  const acceptLanguage = headersList.get('accept-language') || '';
  const browserLanguages = acceptLanguage
    .split(',')
    .map((lang) => lang.split(';')[0].trim());

  // Check if we should redirect to a preferred language version
  const { baseSlug, language: currentLanguage } = parseSlugLanguage(slug);
  const preferredLanguage = getPreferredLanguage(post.availableLanguages, browserLanguages);

  // Only redirect if:
  // 1. Multiple languages are available
  // 2. User is on the default version
  // 3. Preferred language is different from current
  // 4. Preferred language is not 'default'
  if (
    post.availableLanguages.length > 1 &&
    currentLanguage === 'default' &&
    preferredLanguage !== 'default' &&
    preferredLanguage !== currentLanguage
  ) {
    const preferredSlug = `${baseSlug}_${preferredLanguage}`;
    redirect(`/posts/${preferredSlug}`);
  }

  return (
    <div className="relative">
      {/* Language switcher - only shown if multiple languages available */}
      <LanguageSwitcher
        baseSlug={baseSlug}
        currentLanguage={currentLanguage}
        availableLanguages={post.availableLanguages}
      />

      <Post markdownContent={post.content} />
      <RealFooter />
    </div>
  );
}
