import type { MetadataRoute } from 'next';
import { getPosts } from '@/lib/posts';

const BASE_URL = 'https://alanyeung.co';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts();

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/posts/${post.slug}`,
    lastModified: post.created ? new Date(post.created) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

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
