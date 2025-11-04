/**
 * Animation timing constants
 * Centralized timing values for consistent animations across the app
 */

export const ANIMATION_DELAYS = {
  /** Very short delay for micro-interactions */
  MICRO: 0.001,
  /** Standard stagger delay in milliseconds (for index * STAGGER_MS) */
  STAGGER_MS: 100,
  /** Small stagger delay in seconds (for index * STAGGER_SMALL) */
  STAGGER_SMALL: 0.05,
  /** Medium stagger delay in seconds (for index * STAGGER_MEDIUM) */
  STAGGER_MEDIUM: 0.1,
  /** Base delay for title animation offset */
  TITLE_OFFSET: 500,
} as const;

export const ANIMATION_DURATIONS = {
  /** Quick transition duration */
  QUICK: 0.15,
  /** Standard transition duration */
  STANDARD: 0.4,
  /** Dash animation duration */
  DASH_DRAW: 0.5,
} as const;

/**
 * Helper function to calculate stagger delay
 * @param index - The index of the element in a list
 * @param delayValue - The delay multiplier (default: STAGGER_MS)
 * @returns The calculated delay
 */
export const calculateStaggerDelay = (
  index: number,
  delayValue: number = ANIMATION_DELAYS.STAGGER_MS
): number => {
  return index * delayValue;
};
