import { UPTIME_STATUS_PAGE_ID } from '@/data/infrastructure';
import { markdownResponse } from '@/lib/markdown/document';
import { archMarkdown } from '@/lib/markdown/pages';
import { fetchOfficialStatuses } from '@/lib/official-status';
import { fetchUptimeMonitors } from '@/lib/uptime';

/**
 * Markdown version of `/arch`, with the live status the page loads in the
 * browser. Like /api/status, it is re-read at most once a minute.
 */
export const revalidate = 60;

export async function GET() {
  const [monitors, officials] = await Promise.all([
    fetchUptimeMonitors(UPTIME_STATUS_PAGE_ID, AbortSignal.timeout(10_000)).catch((error: unknown) => {
      console.warn('Could not load uptime data', error);
      return null;
    }),
    fetchOfficialStatuses(),
  ]);
  return markdownResponse(archMarkdown({ monitors, officials, checkedAt: new Date() }));
}
