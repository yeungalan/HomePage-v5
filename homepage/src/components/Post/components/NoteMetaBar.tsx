import React from 'react'
import { useCurrentNoteDataSelector } from '../hooks/useCurrentNoteData'

export const NoteMetaBar: React.FC = () => {
  const topic = useCurrentNoteDataSelector(data => data?.data.topic)
  const tags = topic?.tags || []

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
      {topic && (
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
          {topic.name}
        </span>
      )}
      {tags.map((tag, index) => (
        <span
          key={index}
          className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
        >
          Post{tag}
        </span>
      ))}
    </div>
  )
}
