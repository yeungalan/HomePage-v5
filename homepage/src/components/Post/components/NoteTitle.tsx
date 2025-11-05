import React from 'react'
import { useCurrentNoteDataSelector } from '../hooks/useCurrentNoteData'

export const NoteTitle: React.FC = () => {
  const title = useCurrentNoteDataSelector(data => data?.data.title)

  if (!title) return null
  return (
    <div className="relative">
      <h1 className="my-8 text-balance text-left text-4xl font-bold leading-tight text-gray-900 dark:text-white">
        {title}
      </h1>
    </div>
  )
}
