import React from 'react'
import { TableOfContents } from './TableOfContents'
import { ReadingProgress } from './ReadingProgress'

export const NoteRightSidebar: React.FC = () => {
  return (
    <div className="sticky top-[90px] min-h-[300px] hidden xl:block">
      <div className="ml-4 space-y-8">
        <TableOfContents />
        <div className="border-t pt-6">
          <ReadingProgress />
        </div>
      </div>
    </div>
  )
}
