/**
 * Shared colour palette for charts. The colours are chosen to stay legible
 * on both the light and dark post backgrounds.
 */
export const CHART_PALETTE = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#14b8a6', // teal
  '#a855f7', // purple
] as const

/** Pick a palette colour by index, wrapping around when needed. */
export const paletteColor = (index: number): string =>
  CHART_PALETTE[index % CHART_PALETTE.length]
