import { markdownResponse } from '@/lib/markdown/document';
import { projectsMarkdown } from '@/lib/markdown/pages';

/** Markdown version of `/projects`. */
export const dynamic = 'force-static';

export function GET() {
  return markdownResponse(projectsMarkdown());
}
