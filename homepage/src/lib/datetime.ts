import 'dayjs/locale/zh-cn'

import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'

dayjs.extend(customParseFormat)
dayjs.extend(LocalizedFormat)
dayjs.locale('en-US')

export enum DateFormat {
  'MMM DD YYYY',
  'HH:mm',
  'LLLL',
  'H:mm:ss A',
  'YYYY-MM-DD',
  'YYYY-MM-DD dddd',
  'YYYY-MM-DD ddd',
  'MM-DD ddd',

  'YYYY / M / D dddd',
}

export const parseDate = (
  time: string | Date,
  format: keyof typeof DateFormat,
) => dayjs(time).format(format)

/** Translate function shape (mirrors `useTranslation` from `@/i18n`). */
type TranslateFn = (key: string, vars?: Record<string, string | number>) => string

export const relativeTimeFromNow = (
  time: Date | string,
  t: TranslateFn,
  current = new Date(),
) => {
  if (!time) {
    return ''
  }
  time = new Date(time)
  const msPerMinute = 60 * 1000
  const msPerHour = msPerMinute * 60
  const msPerDay = msPerHour * 24
  const msPerMonth = msPerDay * 30
  const msPerYear = msPerDay * 365

  const elapsed = +current - +time

  // Pick the singular or plural `time.*` key based on the count. CJK locales use
  // an identical template for both, while English supplies distinct wording.
  const phrase = (count: number, singularKey: string, pluralKey: string) =>
    t(`time.${count === 1 ? singularKey : pluralKey}`, { count })

  if (elapsed < msPerMinute) {
    const gap = Math.ceil(elapsed / 1000)
    return gap <= 0 ? t('time.justNow') : phrase(gap, 'secondAgo', 'secondsAgo')
  } else if (elapsed < msPerHour) {
    const minutes = Math.round(elapsed / msPerMinute)
    return phrase(minutes, 'minuteAgo', 'minutesAgo')
  } else if (elapsed < msPerDay) {
    const hours = Math.round(elapsed / msPerHour)
    return phrase(hours, 'hourAgo', 'hoursAgo')
  } else if (elapsed < msPerMonth) {
    const days = Math.round(elapsed / msPerDay)
    return phrase(days, 'dayAgo', 'daysAgo')
  } else if (elapsed < msPerYear) {
    const months = Math.round(elapsed / msPerMonth)
    return phrase(months, 'monthAgo', 'monthsAgo')
  } else {
    const years = Math.round(elapsed / msPerYear)
    return phrase(years, 'yearAgo', 'yearsAgo')
  }
}

export const dayOfYear = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  const day = Math.floor(diff / oneDay)
  return day
}

export function daysOfYear(year?: number) {
  return isLeapYear(year ?? new Date().getFullYear()) ? 366 : 365
}

export function isLeapYear(year: number) {
  return year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)
}

export const secondOfDay = () => {
  const dt = new Date()
  const secs = dt.getSeconds() + 60 * (dt.getMinutes() + 60 * dt.getHours())
  return secs
}

export const secondOfDays = 86400

export function isValidDate(d: unknown): d is Date {
  return d instanceof Date && !Number.isNaN(+d)
}

export function formatSeconds(seconds: number) {
  const days = Math.floor(seconds / (3600 * 24))
  seconds -= days * 3600 * 24
  const hrs = Math.floor(seconds / 3600)
  seconds -= hrs * 3600
  const mins = Math.floor(seconds / 60)

  let formatted = ''
  if (days > 0) formatted += `${days} day${days === 1 ? '' : 's'} `
  if (hrs > 0) formatted += `${hrs} hour${hrs === 1 ? '' : 's'} `
  if (mins > 0) formatted += `${mins} minute${mins === 1 ? '' : 's'}`

  return formatted.trim()
}