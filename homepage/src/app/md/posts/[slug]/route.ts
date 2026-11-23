import { markdownResponse } from '@/lib/markdown/document';
import { notFoundMarkdown } from '@/lib/markdown/pages';
import { postMarkdown } from '@/lib/markdown/posts';
import { getPostSlugs } from '@/lib/posts';

/** Markdown version of `/posts/[slug]`, built for every post at build time. */
export const dynamic = 'force-static';

export async function generateStaticParams() {
  return (await getPostSlugs()).map((slug) => ({ slug }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await postMarkdown(slug);
  return page ? markdownResponse(page) : markdownResponse(notFoundMarkdown(), 404);
}
