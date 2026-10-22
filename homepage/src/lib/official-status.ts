/**
 * Live status of third-party providers, read from each provider's official
 * status page. AWS and Apple don't send CORS headers, so these are fetched on
 * the server by /api/status and the browser reads that route instead.
 */

import type { ServiceStatus } from '@/components/FlowGraph';

export type OfficialStatusSource = 'cloudflare' | 'icloud' | 'aws-s3' | 'aws-glacier';

export interface OfficialStatus {
  status: ServiceStatus;
  /** What the provider currently reports, e.g. an incident title. */
  summary?: string;
}

export type OfficialStatuses = Record<OfficialStatusSource, OfficialStatus>;

export const OFFICIAL_STATUS_PAGES: Record<OfficialStatusSource, { name: string; url: string }> = {
  cloudflare: { name: 'Cloudflare Status', url: 'https://www.cloudflarestatus.com' },
  icloud: { name: 'Apple System Status', url: 'https://www.apple.com/support/systemstatus/' },
  'aws-s3': { name: 'AWS Health Dashboard (S3, us-east-1)', url: 'https://health.aws.amazon.com/health/status' },
  'aws-glacier': { name: 'AWS Health Dashboard (Glacier, us-east-1)', url: 'https://health.aws.amazon.com/health/status' },
};

const CLOUDFLARE_API = 'https://www.cloudflarestatus.com/api/v2/summary.json';
const APPLE_API = 'https://www.apple.com/support/systemstatus/data/system_status_en_US.js';
const AWS_API = 'https://health.aws.amazon.com/public/currentevents';

/** Cloudflare components behind the "CDN/DNS" node. */
const CLOUDFLARE_COMPONENTS = ['CDN/Cache', 'DNS Root Servers'];
/** Apple service behind the "iCloud Mail" node. */
const APPLE_SERVICE = 'iCloud Mail';
const AWS_SERVICES: Record<'aws-s3' | 'aws-glacier', string> = {
  'aws-s3': 's3-us-east-1',
  'aws-glacier': 'glacier-us-east-1',
};

const SEVERITY: Record<ServiceStatus, number> = { unknown: -1, paused: -1, healthy: 0, warning: 1, unhealthy: 2 };

const worst = (statuses: ServiceStatus[]): ServiceStatus =>
  statuses.reduce<ServiceStatus>((acc, s) => (SEVERITY[s] > SEVERITY[acc] ? s : acc), 'healthy');

const getResponse = async (url: string) => {
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`${url} responded with ${res.status}`);
  return res;
};

const CLOUDFLARE_STATUS: Record<string, ServiceStatus> = {
  operational: 'healthy',
  degraded_performance: 'warning',
  partial_outage: 'warning',
  under_maintenance: 'warning',
  major_outage: 'unhealthy',
};

async function fetchCloudflare(): Promise<OfficialStatus> {
  const body = (await (await getResponse(CLOUDFLARE_API)).json()) as {
    components: { name: string; status: string }[];
  };
  const components = body.components.filter((c) => CLOUDFLARE_COMPONENTS.includes(c.name));
  if (components.length === 0) throw new Error('Cloudflare components not found');
  const affected = components.filter((c) => c.status !== 'operational');
  return {
    status: worst(components.map((c) => CLOUDFLARE_STATUS[c.status] ?? 'unknown')),
    summary: affected.length ? affected.map((c) => `${c.name}: ${c.status.replace(/_/g, ' ')}`).join(', ') : undefined,
  };
}

interface AppleEvent {
  statusType: string;
  message: string;
  eventStatus: string;
  epochStartDate: number | null;
  epochEndDate: number | null;
}

async function fetchIcloud(): Promise<OfficialStatus> {
  const body = (await (await getResponse(APPLE_API)).json()) as {
    services: { serviceName: string; events: AppleEvent[] }[];
  };
  const service = body.services.find((s) => s.serviceName === APPLE_SERVICE);
  if (!service) throw new Error(`${APPLE_SERVICE} not found`);
  const now = Date.now();
  const active = service.events.filter(
    (e) =>
      e.eventStatus !== 'resolved' &&
      e.eventStatus !== 'completed' &&
      (e.epochStartDate === null || e.epochStartDate <= now) &&
      (e.epochEndDate === null || e.epochEndDate > now),
  );
  return {
    status: worst(active.map((e) => (e.statusType === 'Outage' ? 'unhealthy' : 'warning'))),
    summary: active[0]?.message,
  };
}

interface AwsEvent {
  service: string;
  status: string;
  summary: string;
  impacted_services?: Record<string, { current: string }>;
}

/** AWS Health levels: 0 resolved, 1 informational, 2 degraded, 3 disrupted. */
const AWS_STATUS: Record<string, ServiceStatus> = { '0': 'healthy', '1': 'healthy', '2': 'warning', '3': 'unhealthy' };

async function fetchAws(): Promise<Record<'aws-s3' | 'aws-glacier', OfficialStatus>> {
  // The feed is JSON encoded as UTF-16 (with a byte order mark).
  const bytes = new Uint8Array(await (await getResponse(AWS_API)).arrayBuffer());
  let encoding = 'utf-8';
  if (bytes[0] === 0xfe && bytes[1] === 0xff) encoding = 'utf-16be';
  else if (bytes[0] === 0xff && bytes[1] === 0xfe) encoding = 'utf-16le';
  const events = JSON.parse(new TextDecoder(encoding).decode(bytes)) as AwsEvent[];

  const statusOf = (service: string): OfficialStatus => {
    const matches = events.flatMap((e) => {
      const level = e.service === service ? e.status : e.impacted_services?.[service]?.current;
      return level === undefined ? [] : [{ status: AWS_STATUS[level] ?? 'warning', summary: e.summary }];
    });
    const status = worst(matches.map((m) => m.status));
    return { status, summary: matches.find((m) => m.status === status)?.summary };
  };
  return { 'aws-s3': statusOf(AWS_SERVICES['aws-s3']), 'aws-glacier': statusOf(AWS_SERVICES['aws-glacier']) };
}

const UNKNOWN: OfficialStatus = { status: 'unknown' };

/** Every provider's status; a provider that can't be reached reports `unknown`. */
export async function fetchOfficialStatuses(): Promise<OfficialStatuses> {
  const settle = async <T>(promise: Promise<T>, fallback: T) => {
    try {
      return await promise;
    } catch (error) {
      console.warn('Could not load official status', error);
      return fallback;
    }
  };
  const [cloudflare, icloud, aws] = await Promise.all([
    settle(fetchCloudflare(), UNKNOWN),
    settle(fetchIcloud(), UNKNOWN),
    settle(fetchAws(), { 'aws-s3': UNKNOWN, 'aws-glacier': UNKNOWN }),
  ]);
  return { cloudflare, icloud, ...aws };
}
