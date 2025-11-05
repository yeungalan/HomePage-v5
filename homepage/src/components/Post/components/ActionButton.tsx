import React from 'react'
import clsx from 'clsx'

interface ActionButtonProps {
  icon: string
  label: string
  onClick: () => void
  count?: number
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  onClick,
  count
}) => {
  return (
    <button
      className="relative flex flex-col items-center space-y-1 p-2 rounded-lg hover:bg-gray-100 transition-colors group"
      onClick={onClick}
      title={label}
    >
      <div className={clsx('text-xl', icon)} />
      {count !== undefined && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {count}
        </span>
      )}
    </button>
  )
}
