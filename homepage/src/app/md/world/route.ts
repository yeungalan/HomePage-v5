import { markdownResponse } from '@/lib/markdown/document';
import { worldMarkdown } from '@/lib/markdown/pages';

/** Markdown version of `/world`. */
export const dynamic = 'force-static';

export function GET() {
  return markdownResponse(worldMarkdown());
}
