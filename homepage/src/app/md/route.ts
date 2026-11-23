import { markdownResponse } from '@/lib/markdown/document';
import { homeMarkdown } from '@/lib/markdown/pages';

/**
 * Markdown version of `/`. next.config.ts rewrites requests that send
 * `Accept: text/markdown` to the handlers under this folder.
 */
export const dynamic = 'force-static';

export function GET() {
  return markdownResponse(homeMarkdown());
}
