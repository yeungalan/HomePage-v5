'use client';

import type { FC } from 'react';
import { motion } from 'motion/react';
import { Icon } from '@iconify/react';
import { TIMEZONES, getDaylightInfo } from '@/constants/timezones';

function getDayOffset(date: Date, tz: string): number {
  const localeDateString = (timeZone?: string) =>
    date.toLocaleDateString('en-CA', { timeZone });
  const toUtcMs = (day: string) => new Date(`${day}T00:00:00Z`).getTime();
  return Math.round(
    (toUtcMs(localeDateString(tz)) - toUtcMs(localeDateString())) / 86_400_000
  );
}

interface TimezoneGridProps {
  time: Date;
}

export const TimezoneGrid: FC<TimezoneGridProps> = ({ time }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.6 }}
    className="grid grid-cols-2 gap-4 sm:gap-6"
  >
    {TIMEZONES.map(({ label, tz, lat, lng }) => {
      const { icon, gradient, textColor } = getDaylightInfo(time, lat, lng);
      const dayOffset = getDayOffset(time, tz);
      return (
        <div
          key={tz}
          className="rounded-2xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 text-center transition-colors duration-500"
          style={{ background: gradient }}
        >
          <p className={`text-xs sm:text-sm mb-1 ${textColor} opacity-70 flex items-center justify-center gap-1`}>
            <Icon icon={icon} className="text-base" /> {label}
          </p>
          <p className={`text-lg sm:text-xl md:text-2xl font-bold font-mono ${textColor}`}>
            {time.toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false })}
            {dayOffset !== 0 && (
              <sup className="ml-0.5 align-super text-[0.6em] font-semibold opacity-70">
                {dayOffset > 0 ? `+${dayOffset}` : dayOffset}
              </sup>
            )}
          </p>
        </div>
      );
    })}
  </motion.div>
);
