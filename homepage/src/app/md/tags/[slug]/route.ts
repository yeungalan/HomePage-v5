import { markdownResponse } from '@/lib/markdown/document';
import { notFoundMarkdown } from '@/lib/markdown/pages';
import { tagMarkdown } from '@/lib/markdown/posts';
import { getAllTags } from '@/lib/posts';

/** Markdown version of `/tags/[slug]`, built for every tag at build time. */
export const dynamic = 'force-static';

export async function generateStaticParams() {
  return (await getAllTags()).map((tag) => ({ slug: tag }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await tagMarkdown(slug);
  return page ? markdownResponse(page) : markdownResponse(notFoundMarkdown(), 404);
}
