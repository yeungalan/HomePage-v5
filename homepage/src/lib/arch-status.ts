/**
 * Live status of the services on the /arch diagram, shared by the page
 * (`app/arch/page.tsx`) and its Markdown version for agents
 * (`lib/markdown/pages.ts`). Safe to import from server and client code.
 */

import type { FlowGraphConfig, Service, ServiceStatus } from '@/components/FlowGraph';
import type { TranslateFn } from '@/i18n/translate';
import type { OfficialStatuses } from '@/lib/official-status';
import { formatRatio, type UptimeMonitor } from '@/lib/uptime';

/** `arch.uptime.status.*` message key for each service status ("Up", "Down", …). */
export const STATUS_LABEL_KEY: Record<ServiceStatus, string> = {
  healthy: 'up',
  unhealthy: 'down',
  warning: 'warning',
  paused: 'paused',
  unknown: 'unknown',
};

/**
 * Apply live status to the services: UptimeRobot status and 30-day uptime for
 * the ones with a monitor, the provider's official status for third-party
 * services, then the combined status of what sits behind an aggregate node.
 */
export const withLiveStatus = (
  config: FlowGraphConfig,
  monitors: Map<number, UptimeMonitor> | null,
  officials: OfficialStatuses | null,
  t: TranslateFn,
): FlowGraphConfig => {
  const services = config.services.map((service): Service => {
    const official = service.statusSource && officials?.[service.statusSource];
    if (official) return { ...service, status: official.status };
    const monitor = service.uptimeMonitorId === undefined ? undefined : monitors?.get(service.uptimeMonitorId);
    if (!monitor) return service;
    const showRatio = monitor.status !== 'paused' && monitor.ratio30d !== null;
    return {
      ...service,
      status: monitor.status,
      uptime: showRatio ? t('arch.uptime.nodeSummary', { ratio: formatRatio(monitor.ratio30d!) }) : undefined,
    };
  });
  const byId = new Map(services.map((s) => [s.serviceId, s]));
  return {
    ...config,
    services: services.map((service) => {
      if (!service.statusFromDownstream) return service;
      const downstream = config.connections
        .filter(([from]) => from === service.serviceId)
        .map(([, to]) => byId.get(to)?.status ?? 'unknown');
      return { ...service, status: combineDownstream(downstream) };
    }),
  };
};

/** Paused and unknown services count as healthy; all down is down, any trouble is degraded. */
const combineDownstream = (statuses: ServiceStatus[]): ServiceStatus => {
  const known = statuses.filter((s) => s === 'healthy' || s === 'warning' || s === 'unhealthy');
  if (known.every((s) => s === 'healthy')) return 'healthy';
  if (known.every((s) => s === 'unhealthy')) return 'unhealthy';
  return 'warning';
};

export type Overall = 'operational' | 'partial' | 'down';

/** Overall state of every live service except the end user. */
export const overallStatus = (services: Service[]): Overall | null => {
  const known = services
    .filter((s) => s.serviceId !== 'user')
    .map((s) => s.status)
    .filter((s) => s === 'healthy' || s === 'warning' || s === 'unhealthy');
  if (known.length === 0) return null;
  if (known.every((s) => s === 'healthy')) return 'operational';
  if (known.every((s) => s === 'unhealthy')) return 'down';
  return 'partial';
};

/** Mean 30-day uptime of the monitored services that aren't paused. */
export const averageUptime = (services: Service[], monitors: Map<number, UptimeMonitor> | null): number | null => {
  const ratios = services.flatMap((s) => {
    const monitor = s.uptimeMonitorId === undefined ? undefined : monitors?.get(s.uptimeMonitorId);
    return monitor && monitor.status !== 'paused' && monitor.ratio30d !== null ? [monitor.ratio30d] : [];
  });
  return ratios.length ? ratios.reduce((a, b) => a + b, 0) / ratios.length : null;
};
