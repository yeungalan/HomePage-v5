import React from 'react'
import dayjs from 'dayjs'
import { useCurrentNoteDataSelector } from '../hooks/useCurrentNoteData'
import { ClockIcon } from './ClockIcon'

export const NoteDateMeta: React.FC = () => {
  const created = useCurrentNoteDataSelector(data => data?.data.created)

  if (!created) return null
  const dateFormat = dayjs(created).format('MMMM D, YYYY')

  return (
    <span className="inline-flex items-center gap-1">
      <ClockIcon />
      <time className="font-medium" suppressHydrationWarning>
        {dateFormat}
      </time>
    </span>
  )
}
