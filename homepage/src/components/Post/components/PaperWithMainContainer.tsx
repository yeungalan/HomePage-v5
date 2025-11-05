import React from 'react'

interface PaperWithMainContainerProps {
  children: React.ReactNode
}

export const PaperWithMainContainer: React.FC<PaperWithMainContainerProps> = ({
  children
}) => {
  return (
    <div className="relative min-w-0">
      <div className="bg-white dark:bg-zinc-900 shadow-sm rounded-lg px-6 py-8 md:px-12 md:py-12">
        {children}
      </div>
    </div>
  )
}
