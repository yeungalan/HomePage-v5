import { markdownResponse } from '@/lib/markdown/document';
import { goalsMarkdown } from '@/lib/markdown/pages';

/** Markdown version of `/goals`. Rendered per request: it shows the current time and the year's progress. */
export const dynamic = 'force-dynamic';

export function GET() {
  return markdownResponse(goalsMarkdown(new Date()));
}
