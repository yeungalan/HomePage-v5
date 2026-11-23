import { markdownResponse } from '@/lib/markdown/document';
import { friendsMarkdown } from '@/lib/markdown/pages';

/** Markdown version of `/friends`. */
export const dynamic = 'force-static';

export function GET() {
  return markdownResponse(friendsMarkdown());
}
