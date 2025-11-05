import dayjs from 'dayjs'

/**
 * Parse and format date string
 */
export const parseDate = (date: string, format: string) => {
  return dayjs(date).format(format)
}
