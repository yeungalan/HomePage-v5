import React, { useState, useEffect } from 'react'

export const ReadingProgress: React.FC = () => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const calculateProgress = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY

      // Calculate how much of the document has been scrolled
      const scrollableHeight = documentHeight - windowHeight
      const scrollPercentage =
        scrollableHeight > 0
          ? Math.min(Math.round((scrollTop / scrollableHeight) * 100), 100)
          : 0

      setProgress(scrollPercentage)
    }

    // Calculate on mount
    calculateProgress()

    // Add scroll listener
    window.addEventListener('scroll', calculateProgress)
    window.addEventListener('resize', calculateProgress)

    return () => {
      window.removeEventListener('scroll', calculateProgress)
      window.removeEventListener('resize', calculateProgress)
    }
  }, [])

  // Circle parameters - smaller size
  const size = 20
  const strokeWidth = 3
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="flex items-center gap-3">
      {/* SVG Circle Progress */}
      <div className="relative inline-flex items-center justify-center flex-shrink-0">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#155DFC"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-out"
          />
        </svg>
      </div>

      {/* Percentage text */}
      <div className="text-sm font-medium text-gray-700 dark:text-white">
        {progress}%
      </div>
    </div>
  )
}
