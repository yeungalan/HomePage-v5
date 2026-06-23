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
export const RelativeTime: FC<{
  date: string | Date
  displayAbsoluteTimeAfterDay?: number
}> = (props) => {
  const { displayAbsoluteTimeAfterDay = 29 } = props
  const t = useTranslation()
  const [relative, setRelative] = useState<string>(() =>
    formatTime(props.date, t, displayAbsoluteTimeAfterDay),
  )

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
