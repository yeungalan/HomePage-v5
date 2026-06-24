'use client';

import type { FC } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from '@/i18n';

interface YearStatsProps {
  dayOfYear: number;
  yearProgress: string;
  todayProgress: string;
}

export const YearStats: FC<YearStatsProps> = ({ dayOfYear, yearProgress, todayProgress }) => {
  const t = useTranslation();
  const stats = [
    { label: t('goals.dayOfYear'), value: String(dayOfYear) },
    { label: t('goals.yearProgress'), value: `${yearProgress}%` },
    { label: t('goals.todayProgress'), value: `${todayProgress}%` },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"
    >
      {stats.map(({ label, value }) => (
        <div
          key={label}
          className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700"
        >
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
          <p className="text-lg sm:text-xl md:text-2xl font-bold dark:text-white">{value}</p>
        </div>
      ))}
    </motion.div>
  );
};
