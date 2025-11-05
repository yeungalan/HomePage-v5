import React from 'react'
import { useCurrentNoteDataSelector } from '../hooks/useCurrentNoteData'
import { parseDate } from '../utils/dateParser'
import { FloatPopover } from './FloatPopover'
import { NoteDateMeta } from './NoteDateMeta'

export const NoteHeaderDate: React.FC = () => {
  const date = useCurrentNoteDataSelector(data => ({
    created: data?.data.created,
    modified: data?.data.modified
  }))

  if (!date?.created) return null

  const tips = `Created on ${parseDate(date.created, 'MMMM D, YYYY')}${
    date.modified
      ? `, modified on ${parseDate(date.modified, 'MMMM D, YYYY')}`
      : ''
  }`

  return <FloatPopover TriggerComponent={NoteDateMeta}>{tips}</FloatPopover>
}
