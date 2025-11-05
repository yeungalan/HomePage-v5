import React, { useState } from 'react'

interface FloatPopoverProps {
  children: React.ReactNode
  TriggerComponent: React.ComponentType
}

export const FloatPopover: React.FC<FloatPopoverProps> = ({
  children,
  TriggerComponent
}) => {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        <TriggerComponent />
      </div>
      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-sm rounded whitespace-nowrap z-10">
          {children}
        </div>
      )}
    </div>
  )
}
