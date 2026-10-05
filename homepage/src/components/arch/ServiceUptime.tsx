'use client'

import type { FC } from 'react'
import { Icon } from '@iconify/react'

import type { Service, ServiceStatus } from '@/components/FlowGraph'
import { HEALTH_STATUS_COLORS } from '@/constants/colors'
import { UPTIME_STATUS_PAGE_ID, UPTIME_STATUS_PAGE_URL } from '@/data/infrastructure'
import { useUptimeEvents } from '@/hooks/use-uptime'
import { useI18n } from '@/i18n'
import { formatDuration, formatRatio, type UptimeMonitor } from '@/lib/uptime'

const STATUS_LABEL_KEY: Record<ServiceStatus, string> = {
  healthy: 'up',
  unhealthy: 'down',
  warning: 'warning',
  paused: 'paused',
  unknown: 'unknown',
}

/** Translated label for a service status ("Up", "Down", …). */
export const useStatusLabel = () => {
  const { t } = useI18n()
  return (status: ServiceStatus) => t(`arch.uptime.status.${STATUS_LABEL_KEY[status]}`)
}

const dayColor = (ratio: number) => {
  if (ratio >= 99.9) return 'bg-green-500'
  if (ratio >= 98) return 'bg-amber-400'
  return 'bg-red-500'
}

export const StatusBadge: FC<{ status: ServiceStatus }> = ({ status }) => {
  const colors = HEALTH_STATUS_COLORS[status]
  const label = useStatusLabel()
  return (
    <span
      data-cy="uptime-status"
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
      style={{ background: colors.bg, color: colors.color }}
    >
      <Icon icon={colors.icon} width="14" height="14" />
      {label(status)}
    </span>
  )
}

const RecentEvents: FC<{ monitorId: number }> = ({ monitorId }) => {
  const { t, locale } = useI18n()
  const { events, failed } = useUptimeEvents(UPTIME_STATUS_PAGE_ID, monitorId)
  const label = useStatusLabel()
  const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' })

  if (failed) return <p className="text-sm text-gray-500 dark:text-gray-400">{t('arch.uptime.eventsUnavailable')}</p>
  if (!events) return <p className="text-sm text-gray-500 dark:text-gray-400">{t('arch.uptime.loading')}</p>
  if (events.length === 0) return <p className="text-sm text-gray-500 dark:text-gray-400">{t('arch.uptime.noEvents')}</p>

  return (
    <ul className="space-y-2" data-cy="uptime-events">
      {events.map((event) => {
        const status: ServiceStatus = event.isUp ? 'healthy' : 'unhealthy'
        return (
          <li key={event.at.toISOString()} className="flex flex-wrap items-baseline gap-x-2 text-sm">
            <span className="font-semibold" style={{ color: HEALTH_STATUS_COLORS[status].color }}>
              {label(status)}
            </span>
            <span className="text-gray-900 dark:text-gray-100">{dateFormat.format(event.at)}</span>
            <span className="text-gray-500 dark:text-gray-400">
              {formatDuration(event.seconds, locale)}
              {event.ongoing && ` (${t('arch.uptime.ongoing')})`}
            </span>
            {event.reason && <span className="text-gray-500 dark:text-gray-400">{event.reason}</span>}
          </li>
        )
      })}
    </ul>
  )
}

interface ServiceUptimeProps {
  service: Service
  /** Live data for the service's monitor, if loaded. */
  monitor: UptimeMonitor | undefined
  /** True until the first monitor list has loaded or failed. */
  loading: boolean
}

/** Uptime section of the /arch node detail panel. */
export const ServiceUptime: FC<ServiceUptimeProps> = ({ service, monitor, loading }) => {
  const { t, locale } = useI18n()
  const muted = 'text-sm text-gray-500 dark:text-gray-400'

  let body
  if (service.uptimeMonitorId === undefined) {
    body = <p className={muted}>{t('arch.uptime.notMonitored')}</p>
  } else if (!monitor) {
    body = <p className={muted}>{t(loading ? 'arch.uptime.checking' : 'arch.uptime.unavailable')}</p>
  } else if (monitor.status === 'paused') {
    body = (
      <div className="space-y-2">
        <StatusBadge status={monitor.status} />
        <p className={muted}>{t('arch.uptime.paused')}</p>
      </div>
    )
  } else {
    const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' })
    const { lastDowntime } = monitor
    body = (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <StatusBadge status={monitor.status} />
          {[
            { label: t('arch.uptime.last30Days'), ratio: monitor.ratio30d },
            { label: t('arch.uptime.last90Days'), ratio: monitor.ratio90d },
          ].map(({ label, ratio }) =>
            ratio === null ? null : (
              <div key={label}>
                <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white" data-cy="uptime-ratio">
                  {formatRatio(ratio)}
                </div>
              </div>
            ),
          )}
        </div>

        {monitor.days.length > 0 && (
          <div>
            <div className="flex h-6 gap-px" role="img" aria-label={`${t('arch.uptime.title')}: ${monitor.days.length}d`}>
              {monitor.days.map((day) => (
                <span
                  key={day.date}
                  title={`${day.date}: ${formatRatio(day.ratio)}`}
                  className={`flex-1 rounded-[1px] ${dayColor(day.ratio)}`}
                />
              ))}
            </div>
            <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{t('arch.uptime.daysAgo', { count: monitor.days.length })}</span>
              <span>{t('arch.uptime.today')}</span>
            </div>
          </div>
        )}

        <div>
          <h5 className="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">{t('arch.uptime.lastDowntime')}</h5>
          <p className="text-sm text-gray-900 dark:text-gray-100">
            {lastDowntime
              ? t('arch.uptime.lastDowntimeValue', {
                  date: dateFormat.format(lastDowntime.at),
                  duration: formatDuration(lastDowntime.seconds, locale),
                })
              : t('arch.uptime.noDowntime')}
          </p>
        </div>

        <div>
          <h5 className="mb-2 text-xs font-semibold text-gray-700 dark:text-gray-300">{t('arch.uptime.recentEvents')}</h5>
          <RecentEvents monitorId={monitor.id} />
        </div>
      </div>
    )
  }

  return (
    <div className="mt-6 border-t border-gray-200 pt-5 dark:border-neutral-800" data-cy="service-uptime">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('arch.uptime.title')}</h4>
        {service.uptimeMonitorId !== undefined && (
          <a
            href={`${UPTIME_STATUS_PAGE_URL}/${service.uptimeMonitorId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400"
          >
            {t('arch.uptime.viewStatusPage')}
            <Icon icon="mingcute:external-link-line" width="14" height="14" />
          </a>
        )}
      </div>
      {body}
    </div>
  )
}
