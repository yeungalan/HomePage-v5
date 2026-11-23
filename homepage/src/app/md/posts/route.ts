import { markdownResponse } from '@/lib/markdown/document';
import { postsMarkdown } from '@/lib/markdown/posts';

/** Markdown version of `/posts`. */
export const dynamic = 'force-static';

export async function GET() {
  return markdownResponse(await postsMarkdown());
}
