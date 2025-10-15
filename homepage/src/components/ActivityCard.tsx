'use client'

import clsx from 'clsx'
import { Icon } from '@iconify/react'
import { useMemo } from 'react'

export const iconClassName =
  'rounded-full border shrink-0 border-pink-300 dark:border-pink-700 text-base center inline-flex size-[32px] text-pink-500 dark:text-pink-400 bg-white dark:bg-zinc-900'

interface ActivityCardProps {
  type: 'work' | 'education' | 'milestone'
  title: string
  organization?: string
  startDate: string
  endDate: string
  icon: string
  isOngoing?: boolean
}

const formatDateRange = (start: string, end: string, isOngoing?: boolean) => {
  if (isOngoing) {
    return `${start} - Present`
  }
  if (start === end) {
    return start
  }
  return `${start} - ${end}`
}

export const ActivityCard = ({
  type,
  title,
  organization,
  startDate,
  endDate,
  icon,
  isOngoing
}: ActivityCardProps) => {
  const Content = useMemo(() => {
    return (
      <div className="flex gap-4 items-start w-full">
        <div className={clsx(iconClassName, 'flex-shrink-0')}>
          <Icon icon={icon} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="text-base text-zinc-800 dark:text-zinc-200 space-y-1">
            <div className="font-medium">{title}</div>
            {organization && (
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                {organization}
              </div>
            )}
            <div className="text-sm text-zinc-500 dark:text-zinc-500">
              {formatDateRange(startDate, endDate, isOngoing)}
            </div>
            {isOngoing && (
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Current
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }, [type, title, organization, startDate, endDate, icon, isOngoing])

  return <div className="pb-8 text-base w-full">{Content}</div>
}