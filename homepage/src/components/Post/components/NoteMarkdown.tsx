import React from 'react'
import { useCurrentNoteDataSelector } from '../hooks/useCurrentNoteData'
import { SimpleMarkdown } from './SimpleMarkdown'

export const NoteMarkdown: React.FC = () => {
  const text = useCurrentNoteDataSelector(data => data?.data.text)!
  return (
    <div className="mt-10">
      <SimpleMarkdown content={text} />
    </div>
  )
}
