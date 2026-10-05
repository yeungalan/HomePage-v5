/**
 * Live monitor data from the public UptimeRobot status page.
 *
 * The status page API is public and sends `Access-Control-Allow-Origin: *`,
 * so the browser reads it directly; no server route or API key is involved.
 */

import type { ServiceStatus } from '@/components/FlowGraph';

const UPTIME_API = 'https://stats.uptimerobot.com/api';

export interface UptimeDay {
  date: string;
  ratio: number;
}

export interface UptimeMonitor {
  id: number;
  name: string;
  type: string;
  status: ServiceStatus;
  ratio30d: number | null;
  ratio90d: number | null;
  /** Daily uptime ratios, oldest first (the status page keeps 90 days). */
  days: UptimeDay[];
  lastDowntime: { at: Date; seconds: number; reason: string } | null;
}

export interface UptimeEvent {
  isUp: boolean;
  at: Date;
  /** How long this state lasted; for the newest event, how long it has lasted so far. */
  seconds: number;
  ongoing: boolean;
  reason: string;
}

interface RawRatio {
  ratio: string;
}

interface RawMonitor {
  monitorId: number;
  statusClass: string;
  name: string;
  type: string;
  dailyRatios?: { date: string; ratio: string }[];
  '30dRatio'?: RawRatio;
  '90dRatio'?: RawRatio;
  lastDowntime?: { date: string; duration: number; reason: string } | null;
}

interface RawLog {
  class: string;
  dateGMTISO: string;
  reason?: { code?: string; detail?: { short?: string } };
}

const STATUS_BY_CLASS: Record<string, ServiceStatus> = {
  success: 'healthy',
  warning: 'warning',
  danger: 'unhealthy',
  paused: 'paused',
};

/** Monitor names come HTML-escaped, e.g. `Minecraft &#40;25565&#41;`. */
const decodeEntities = (text: string) =>
  text
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

const toRatio = (raw?: RawRatio) => {
  const ratio = raw ? parseFloat(raw.ratio) : NaN;
  return Number.isFinite(ratio) ? ratio : null;
};

const toMonitor = (raw: RawMonitor, timezone: string): UptimeMonitor => ({
  id: raw.monitorId,
  name: decodeEntities(raw.name),
  type: raw.type,
  status: STATUS_BY_CLASS[raw.statusClass] ?? 'unknown',
  ratio30d: toRatio(raw['30dRatio']),
  ratio90d: toRatio(raw['90dRatio']),
  days: (raw.dailyRatios ?? []).map((day) => ({ date: day.date, ratio: parseFloat(day.ratio) })),
  // `lastDowntime.date` is "YYYY-MM-DD HH:mm:ss" in the status page's timezone.
  lastDowntime: raw.lastDowntime
    ? {
        at: new Date(`${raw.lastDowntime.date.replace(' ', 'T')}${timezone}`),
        seconds: raw.lastDowntime.duration,
        reason: raw.lastDowntime.reason,
      }
    : null,
});

const getJson = async <T>(url: string, signal?: AbortSignal): Promise<T> => {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`UptimeRobot responded with ${res.status}`);
  const body = (await res.json()) as T & { status?: string };
  if (body.status !== 'ok') throw new Error('Unexpected UptimeRobot response');
  return body;
};

/** Every monitor on the status page, keyed by monitor ID. */
export async function fetchUptimeMonitors(pageId: string, signal?: AbortSignal) {
  // One page holds 30 monitors, which covers this status page.
  const body = await getJson<{ data: RawMonitor[]; psp?: { timezone?: string } }>(
    `${UPTIME_API}/getMonitorList/${pageId}?page=1`,
    signal,
  );
  const timezone = body.psp?.timezone ?? '+00:00';
  return new Map(body.data.map((raw) => [raw.monitorId, toMonitor(raw, timezone)]));
}

/** The most recent up/down events for one monitor, newest first. */
export async function fetchUptimeEvents(pageId: string, monitorId: number, limit: number, signal?: AbortSignal) {
  const body = await getJson<{ monitor: { logs?: RawLog[] } }>(
    `${UPTIME_API}/getMonitor/${pageId}?m=${monitorId}`,
    signal,
  );
  const logs = body.monitor.logs ?? [];
  // The API reports 0 seconds for "up" events, so measure each state until the next event.
  return logs.slice(0, limit).map((log, i): UptimeEvent => {
    const at = new Date(log.dateGMTISO);
    const end = i === 0 ? Date.now() : new Date(logs[i - 1].dateGMTISO).getTime();
    const { code, detail } = log.reason ?? {};
    return {
      isUp: log.class === 'success',
      at,
      seconds: Math.max(0, Math.round((end - at.getTime()) / 1000)),
      ongoing: i === 0,
      reason: [code && code !== '0' ? code : '', detail?.short ?? ''].filter(Boolean).join(' '),
    };
  });
}

/** `99.772` → `99.77%`, never rounding up to 100%. */
export const formatRatio = (ratio: number) =>
  ratio >= 100 ? '100%' : `${(Math.floor(ratio * 100) / 100).toFixed(2)}%`;

/** A localized duration such as "23 hr 54 min" or "4 days 21 hr". */
export const formatDuration = (seconds: number, locale: string) => {
  const unit = (value: number, name: 'day' | 'hour' | 'minute' | 'second') =>
    new Intl.NumberFormat(locale, { style: 'unit', unit: name, unitDisplay: 'short' }).format(value);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return hours > 0 ? `${unit(days, 'day')} ${unit(hours, 'hour')}` : unit(days, 'day');
  if (hours > 0) return minutes > 0 ? `${unit(hours, 'hour')} ${unit(minutes, 'minute')}` : unit(hours, 'hour');
  if (minutes > 0) return unit(minutes, 'minute');
  return unit(seconds, 'second');
};
