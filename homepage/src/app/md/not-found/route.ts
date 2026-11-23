import { markdownResponse } from '@/lib/markdown/document';
import { notFoundMarkdown } from '@/lib/markdown/pages';

/** Markdown 404, for agents asking for a URL that matches no page (see the fallback rewrite in next.config.ts). */
export const dynamic = 'force-static';

export function GET() {
  return markdownResponse(notFoundMarkdown(), 404);
}
