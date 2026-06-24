'use client';

import type { FC } from 'react';
import { motion } from 'motion/react';
import { Icon } from '@iconify/react';

interface ClockDisplayProps {
  hours: string;
  minutes: string;
  seconds: string;
  utcHours: string;
  utcMinutes: string;
  utcSeconds: string;
}

export const ClockDisplay: FC<ClockDisplayProps> = ({
  hours, minutes, seconds, utcHours, utcMinutes, utcSeconds,
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6, delay: 0.2 }}
    className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 border border-gray-200 dark:border-gray-700"
  >
    <div className="flex justify-center items-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
      <ClockDigit value={hours} unit="hours" />
      <ColonSeparator />
      <ClockDigit value={minutes} unit="minutes" />
      <ColonSeparator />
      <ClockDigit value={seconds} unit="seconds" className="text-blue-400 dark:text-blue-500" />
    </div>
    <div className="flex justify-center items-center gap-2 text-gray-500 dark:text-gray-400">
      <Icon icon="mdi:earth" className="text-lg sm:text-xl" />
      <span className="text-sm sm:text-base md:text-lg font-mono">
        UTC {utcHours}:{utcMinutes}:{utcSeconds}
      </span>
    </div>
  </motion.div>
)

const ClockDigit: FC<{ value: string; unit: string; className?: string }> = ({
  value, unit, className = 'dark:text-white',
}) => (
  <motion.div
    key={`${unit}-${value}`}
    initial={{ y: -20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    className={`text-4xl sm:text-6xl md:text-8xl font-bold font-mono tracking-tight ${className}`}
  >
    {value}
  </motion.div>
)

const ColonSeparator = () => (
  <span className="text-4xl sm:text-6xl md:text-8xl font-bold text-gray-400 dark:text-gray-500">:</span>
)
