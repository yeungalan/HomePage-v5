import React from 'react'
import clsx from 'clsx'
import { TocItem as TocItemType } from '../types'

interface TocItemProps {
  item: TocItemType
  isActive: boolean
  rootDepth: number
  onClick: (anchorId: string) => void
  setRef: (el: HTMLButtonElement | null) => void
}

export const TocItem: React.FC<TocItemProps> = ({
  item,
  isActive,
  rootDepth,
  onClick,
  setRef
}) => {
  const baseIndent = (item.depth - rootDepth + (isActive ? 1 : 0)) * 0.5

  return (
    <button
      ref={setRef}
      onClick={() => onClick(item.anchorId)}
      className={clsx(
        'relative block w-full text-left text-xs py-1 px-2 rounded transition-all duration-500',
        isActive
          ? 'text-blue-600 font-medium dark:text-white'
          : 'text-gray-600 hover:text-gray-900 hover:opacity-100 dark:hover:text-gray-400 dark:text-white'
      )}
      style={{ paddingLeft: `${baseIndent + 0.5}rem` }}
      title={item.title}
    >
      <span className="block truncate leading-normal">{item.title}</span>
    </button>
  )
}
