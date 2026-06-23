import type { MetadataRoute } from 'next';
import { getPosts } from '@/lib/posts';
import { SITE_CONFIG } from '@/constants/site';

const BASE_URL = SITE_CONFIG.url;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts();

  // Emit an entry for every language variant of each post, not just the
  // default one, so translated pages get indexed too.
  const postEntries: MetadataRoute.Sitemap = posts.flatMap((post) => {
    const lastModified = post.created ? new Date(post.created) : new Date();
    return post.availableLanguages.map((lang) => {
      const slug = lang === 'default' ? post.baseSlug : `${post.baseSlug}_${lang}`;
      return {
        url: `${BASE_URL}/posts/${slug}`,
        lastModified,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      };
    });
  });

  const staticPages = ['projects', 'goals', 'friends', 'world', 'arch'].map((page) => ({
    url: `${BASE_URL}/${page}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/posts`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...staticPages,
    ...postEntries,
  ];
}
