'use client';

import type { FC } from 'react';
import { motion } from 'motion/react';
import { Icon } from '@iconify/react';
import { GOALS_2026, GOAL_STATUS_CONFIG } from '@/data/goals';
import { useTranslation } from '@/i18n';

const GOAL_STATUS_LABEL_KEYS: Record<string, string> = {
  completed: 'goals.statusCompleted',
  in_progress: 'goals.statusInProgress',
  not_started: 'goals.statusNotStarted',
};

interface GoalsListProps {
  year: number;
}

export const GoalsList: FC<GoalsListProps> = ({ year }) => {
  const t = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 md:p-8 border border-gray-200 dark:border-gray-700"
    >
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 text-gray-900 dark:text-white">
        <Icon icon="mage:goals" className="text-3xl sm:text-4xl" />
        <span>{t('goals.titleYear', { year })}</span>
      </h2>
      <div className="space-y-3 sm:space-y-4">
        {GOALS_2026.map((goal, index) => {
          const statusConfig = GOAL_STATUS_CONFIG[goal.status];
          const statusLabel = t(GOAL_STATUS_LABEL_KEYS[goal.status]);

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.9 + index * 0.1 }}
              className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-[#fafafa] dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700"
            >
              <Icon
                icon={statusConfig.icon}
                className={`text-2xl sm:text-3xl ${statusConfig.color} flex-shrink-0 mt-1`}
              />
              <div className="flex-1">
                <h3 className="font-semibold text-base sm:text-lg mb-1 text-gray-900 dark:text-white">
                  {goal.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{statusLabel}</p>
                {goal.description && (
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mt-1">
                    {goal.description}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
