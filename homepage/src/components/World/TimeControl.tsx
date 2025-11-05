/**
 * Time control component for World visualization
 */

import React from 'react'
import { motion } from 'framer-motion'
import { Icon } from '@iconify/react'
import { TIME_MODE_POSITIONS } from '@/constants/world'

export type TimeMode = 'paused' | 'realtime' | 'animated' | 'stopped'

interface TimeControlProps {
  timeMode: TimeMode
  onModeChange: (mode: TimeMode) => void
  globeMaterial: unknown
}

const getIndicatorPosition = (timeMode: TimeMode) => {
  return TIME_MODE_POSITIONS[timeMode as keyof typeof TIME_MODE_POSITIONS]
}

export const TimeControl: React.FC<TimeControlProps> = ({
  timeMode,
  onModeChange,
  globeMaterial,
}) => {
  return (
    <motion.div
      className="fixed right-4 bottom-4 text-sky-300 font-mono text-sm sm:text-base bg-black/50 px-3 py-2 rounded backdrop-blur-sm z-10"
      style={{
        bottom: 'max(1rem, calc(env(safe-area-inset-bottom) + 1rem))',
        right: 'max(1rem, calc(env(safe-area-inset-left) + 1rem))',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: globeMaterial ? 1 : 0, y: globeMaterial ? 0 : 20 }}
      transition={{
        duration: 0.8,
        delay: 0.5,
        ease: 'easeOut',
      }}
    >
      <div className="relative inline-block">
        {/* Animated Indicator */}
        <motion.div
          className="absolute top-[4px] z-0 size-[32px] rounded-full bg-white shadow-lg"
          initial={false}
          animate={{
            left: getIndicatorPosition(timeMode),
          }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 30,
          }}
        />

        {/* Button Group */}
        <div className="relative inline-flex rounded-full border border-zinc-200 dark:border-zinc-700 p-[3px]">
          <button
            aria-label="Pause time"
            type="button"
            onClick={() => onModeChange('paused')}
            className="relative z-10 inline-flex h-[32px] w-[32px] items-center justify-center rounded-full border-0 transition-colors"
            style={{
              color: timeMode === 'paused' ? '#000' : '#fff',
            }}
          >
            <Icon icon="mdi:pause" className="text-[18px]" />
          </button>
          <button
            aria-label="Real time"
            type="button"
            onClick={() => onModeChange('realtime')}
            className="relative z-10 inline-flex h-[32px] w-[32px] items-center justify-center rounded-full border-0 transition-colors"
            style={{
              color: timeMode === 'realtime' ? '#000' : '#fff',
            }}
          >
            <Icon icon="mdi:clock-outline" className="text-[18px]" />
          </button>
          <button
            aria-label="Animated time"
            type="button"
            onClick={() => onModeChange('animated')}
            className="relative z-10 inline-flex h-[32px] w-[32px] items-center justify-center rounded-full border-0 transition-colors"
            style={{
              color: timeMode === 'animated' ? '#000' : '#fff',
            }}
          >
            <Icon icon="mdi:fast-forward" className="text-[18px]" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
