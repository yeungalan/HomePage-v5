/**
 * Goals data for the goals page
 */

export type GoalStatus = 'completed' | 'in_progress' | 'not_started';

export interface Goal {
  id: string;
  title: string;
  status: GoalStatus;
  description?: string;
}

/**
 * Icon mapping for different goal statuses
 */
export const GOAL_STATUS_CONFIG: Record<GoalStatus, { icon: string; color: string }> = {
  completed: {
    icon: 'mdi:check-circle',
    color: 'text-green-500',
  },
  in_progress: {
    icon: 'mdi:progress-clock',
    color: 'text-yellow-500',
  },
  not_started: {
    icon: 'mdi:circle-outline',
    color: 'text-gray-400 dark:text-gray-600',
  },
};

/**
 * Status label mapping
 */
export const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  completed: 'Completed',
  in_progress: 'In progress',
  not_started: 'Not started',
};

/**
 * 2025 Goals list
 * Can be easily updated to add, remove, or modify goals
 */
export const GOALS_2025: Goal[] = [
  {
    id: 'diving',
    title: 'Diving',
    status: 'completed',
    description: 'Get certified and complete first dive',
  },
  {
    id: 'motorcycle',
    title: 'Motorcycle',
    status: 'completed',
    description: 'Get motorcycle license',
  },
  {
    id: 'stay-healthy',
    title: 'Stay Healthy',
    status: 'in_progress',
    description: 'Maintain regular exercise and healthy habits',
  },
  {
    id: 'find-person',
    title: 'Find a Person I Care Of',
    status: 'in_progress',
    description: 'Build meaningful relationships',
  },
];

/**
 * Get the current year dynamically
 */
export const getCurrentYear = (): number => {
  return new Date().getFullYear();
};

/**
 * Get goals title with current year
 */
export const getGoalsTitle = (): string => {
  return `${getCurrentYear()} Goals`;
};
