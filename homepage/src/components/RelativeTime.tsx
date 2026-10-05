'use client'

import dayjs from 'dayjs'
import type { FC } from 'react'
import { Fragment, useEffect, useState } from 'react'

import { parseDate, relativeTimeFromNow } from '@/lib/datetime'
import { useTranslation } from '@/i18n'

type TranslateFn = ReturnType<typeof useTranslation>

const formatTime = (
  date: string | Date,
  t: TranslateFn,
  relativeBeforeDay?: number,
) => {
  if (
    relativeBeforeDay &&
    Math.abs(dayjs(date).diff(new Date(), 'd')) > relativeBeforeDay
  ) {
    return parseDate(date, 'YYYY-MM-DD')
  }
  return relativeTimeFromNow(date, t)
}
/**
 * The calendar date as written, which reads the same on the server and in any
 * browser. Not parsed: a string without an offset would be read in each side's
 * own timezone and could land on different days.
 */
const toPlainDate = (date: string | Date) => {
  if (date instanceof Date) return date.toISOString().slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}/.exec(date)?.[0] ?? date
}

export const RelativeTime: FC<{
  date: string | Date
  displayAbsoluteTimeAfterDay?: number
}> = (props) => {
  const { displayAbsoluteTimeAfterDay = 29 } = props
  const t = useTranslation()
  // "3 days ago" depends on the current time, and pages are pre-rendered at
  // build time, so start from the plain date and switch once mounted.
  const [relative, setRelative] = useState<string>(() => toPlainDate(props.date))

  useEffect(() => {
    setRelative(formatTime(props.date, t, displayAbsoluteTimeAfterDay))
    const timer: NodeJS.Timeout = setInterval(() => {
      setRelative(formatTime(props.date, t, displayAbsoluteTimeAfterDay))
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [props.date, displayAbsoluteTimeAfterDay, t])

  return <Fragment>{relative}</Fragment>
}
