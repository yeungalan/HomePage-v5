"use client"

import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { BottomToUpTransitionView } from "@/components/BottomToUpTransitionView";
import { motion } from 'motion/react'
import ThreeTierInfrastructure from "@/components/FlowGraph";
import type { FlowGraphConfig, Service, ServiceStatus } from "@/components/FlowGraph";
import { RealFooter } from "@/components/FooterLinks";
import { ServiceUptime, useStatusLabel } from "@/components/arch/ServiceUptime";
import { Icon } from '@iconify/react';
import { useI18n, useTranslation } from "@/i18n";
import { INFRASTRUCTURE_CONFIG, UPTIME_SLA, UPTIME_STATUS_PAGE_ID, UPTIME_STATUS_PAGE_URL } from "@/data/infrastructure";
import { FLOWGRAPH_DEFAULTS, HEALTH_STATUS_COLORS } from "@/constants/colors";
import { useOfficialStatuses, useUptimeMonitors } from "@/hooks/use-uptime";
import type { OfficialStatus, OfficialStatuses } from "@/lib/official-status";
import { formatRatio, type UptimeMonitor } from "@/lib/uptime";

type Translate = ReturnType<typeof useTranslation>;

/**
 * Apply live status to the services: UptimeRobot status and 30-day uptime for
 * the ones with a monitor, the provider's official status for third-party
 * services, then the combined status of what sits behind an aggregate node.
 */
const withLiveStatus = (
  config: FlowGraphConfig,
  monitors: Map<number, UptimeMonitor> | null,
  officials: OfficialStatuses | null,
  t: Translate,
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

type Overall = 'operational' | 'partial' | 'down';

/** Overall state of every live service except the end user. */
const overallStatus = (services: Service[]): Overall | null => {
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
const averageUptime = (services: Service[], monitors: Map<number, UptimeMonitor> | null): number | null => {
  const ratios = services.flatMap((s) => {
    const monitor = s.uptimeMonitorId === undefined ? undefined : monitors?.get(s.uptimeMonitorId);
    return monitor && monitor.status !== 'paused' && monitor.ratio30d !== null ? [monitor.ratio30d] : [];
  });
  return ratios.length ? ratios.reduce((a, b) => a + b, 0) / ratios.length : null;
};

const OVERALL_STYLE: Record<Overall, { status: ServiceStatus; icon: string }> = {
  operational: { status: 'healthy', icon: 'mingcute:check-circle-line' },
  partial: { status: 'warning', icon: 'mingcute:warning-line' },
  down: { status: 'unhealthy', icon: 'mingcute:close-circle-line' },
};

const StatusSummary: FC<{ overall: Overall | null; uptime: number | null; loading: boolean }> = ({
  overall,
  uptime,
  loading,
}) => {
  const t = useTranslation();
  const style = overall ? HEALTH_STATUS_COLORS[OVERALL_STYLE[overall].status] : HEALTH_STATUS_COLORS.unknown;
  let headline = t('arch.summary.unavailable');
  if (loading) headline = t('arch.uptime.checking');
  else if (overall) headline = t(`arch.summary.${overall}`);
  const meetsSla = uptime !== null && uptime >= UPTIME_SLA;

  return (
    <div
      className="mb-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded-xl border px-4 py-3"
      style={{ borderColor: style.color, background: style.bg, color: style.color }}
      data-cy="status-summary"
    >
      <div className="flex items-center gap-2 font-semibold">
        <Icon icon={overall && !loading ? OVERALL_STYLE[overall].icon : 'mingcute:question-line'} width="20" height="20" />
        <span data-cy="status-summary-headline">{headline}</span>
      </div>
      {uptime !== null && (
        <div className="flex flex-wrap items-center gap-x-3 text-sm" data-cy="status-summary-uptime">
          <span>{t('arch.summary.uptime30d', { ratio: formatRatio(uptime) })}</span>
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
            style={{
              background: HEALTH_STATUS_COLORS[meetsSla ? 'healthy' : 'unhealthy'].color,
              color: '#ffffff',
            }}
            data-cy="status-summary-sla"
          >
            {t(meetsSla ? 'arch.summary.slaMet' : 'arch.summary.slaMissed', { target: `${UPTIME_SLA}%` })}
          </span>
        </div>
      )}
    </div>
  );
};

const NodeDetailPanel: FC<{
  node: Service;
  monitor: UptimeMonitor | undefined;
  official: OfficialStatus | undefined;
  loading: boolean;
}> = ({ node, monitor, official, loading }) => {
  const statusLabel = useStatusLabel();
  return (
    <motion.div
      className="mt-6 border border-gray-200 dark:border-neutral-800 rounded-xl shadow-sm bg-white dark:bg-neutral-900 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {node.icon && (
            <div
              className="rounded-lg p-3 flex items-center justify-center"
              style={{ backgroundColor: node.iconBg ?? FLOWGRAPH_DEFAULTS.iconBg }}
            >
              <Icon icon={node.icon} width="32" height="32" style={{ color: node.iconColor ?? FLOWGRAPH_DEFAULTS.iconColor }} />
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{node.serviceName}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{node.serviceId}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</h4>
          <p className="text-gray-600 dark:text-gray-400">{node.serviceDescription ?? 'No description available'}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Details</h4>
          <div className="space-y-2">
            {node.tier && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-500">Tier:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{node.tier}</span>
              </div>
            )}
            {node.serviceType && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-500">Type:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{node.serviceType}</span>
              </div>
            )}
            {node.status && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-500">Status:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{statusLabel(node.status)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <ServiceUptime service={node} monitor={monitor} official={official} loading={loading} />
    </motion.div>
  )
}

const ArchitectureSection: FC = () => {
  const { t, locale } = useI18n();
  const { monitors, updatedAt, failed } = useUptimeMonitors(UPTIME_STATUS_PAGE_ID);
  const { statuses: officials, failed: officialsFailed } = useOfficialStatuses();
  const config = useMemo(
    () => withLiveStatus(INFRASTRUCTURE_CONFIG, monitors, officials, t),
    [monitors, officials, t],
  );
  // Track the selection by ID so the panel follows live updates.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedNode = config.services.find((s) => s.serviceId === selectedId);
  const selectedMonitor =
    selectedNode?.uptimeMonitorId === undefined ? undefined : monitors?.get(selectedNode.uptimeMonitorId);
  const selectedOfficial = selectedNode?.statusSource && officials?.[selectedNode.statusSource];
  const loading = !monitors && !failed;
  const summaryLoading = loading || (!officials && !officialsFailed);

  let caption = t('arch.uptime.checking');
  if (updatedAt) {
    const time = new Intl.DateTimeFormat(locale, { timeStyle: 'short' }).format(updatedAt);
    caption = t('arch.uptime.updatedAt', { time });
  } else if (failed) {
    caption = t('arch.uptime.unavailable');
  }

  return (
    <BottomToUpTransitionView duration={80}>
      <StatusSummary
        overall={overallStatus(config.services)}
        uptime={averageUptime(config.services, monitors)}
        loading={summaryLoading}
      />
      <motion.div
        className="border border-gray-200 dark:border-neutral-800 rounded-xl shadow-sm overflow-hidden bg-white dark:bg-neutral-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <ThreeTierInfrastructure config={config} onNodeClick={(id) => setSelectedId(id)} />
      </motion.div>
      <p className="mt-3 flex flex-wrap items-center gap-x-2 text-xs text-gray-500 dark:text-gray-400" data-cy="uptime-caption">
        <span>{caption}</span>
        <a
          href={UPTIME_STATUS_PAGE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
        >
          {t('arch.uptime.viewStatusPage')}
          <Icon icon="mingcute:external-link-line" width="12" height="12" />
        </a>
      </p>
      {selectedNode && (
        <NodeDetailPanel
          node={selectedNode}
          monitor={selectedMonitor}
          official={selectedOfficial || undefined}
          loading={loading}
        />
      )}
    </BottomToUpTransitionView>
  )
}

export default function ArchPage() {
  const t = useTranslation();
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
        <div className="pt-5">
          <main className="flex w-full flex-col">
            <div className="relative w-full overflow-hidden">
              <div className="w-full">
                <div className="mx-auto mt-14 max-w-3xl px-4 lg:mt-20 lg:px-0 2xl:max-w-4xl">
                  <header className="mb-10">
                    <h1 className="text-3xl font-bold mb-4 dark:text-white">{t('arch.title')}</h1>
                    <h3 className="text-xl text-gray-600 dark:text-gray-300">{t('arch.subtitle')}</h3>
                  </header>
                  <ArchitectureSection />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <RealFooter />
    </div>
  )
}
