'use client'

import dayjs from 'dayjs'
import type { FC } from 'react'
import { Fragment, useEffect, useState } from 'react'

import { parseDate, relativeTimeFromNow } from '@/lib/datetime'

const formatTime = (date: string | Date, relativeBeforeDay?: number) => {
  if (
    relativeBeforeDay &&
    Math.abs(dayjs(date).diff(new Date(), 'd')) > relativeBeforeDay
  ) {
    return parseDate(date, 'YYYY-MM-DD')
  }
  return relativeTimeFromNow(date)
}
export const RelativeTime: FC<{
  date: string | Date
  displayAbsoluteTimeAfterDay?: number
}> = (props) => {
  const { displayAbsoluteTimeAfterDay = 29 } = props
  const [relative, setRelative] = useState<string>(
    formatTime(props.date, displayAbsoluteTimeAfterDay),
  )

  useEffect(() => {
    setRelative(formatTime(props.date, displayAbsoluteTimeAfterDay))
    const timer: NodeJS.Timeout = setInterval(() => {
      setRelative(formatTime(props.date, displayAbsoluteTimeAfterDay))
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [props.date, displayAbsoluteTimeAfterDay])

  return <Fragment>{relative}</Fragment>
}
