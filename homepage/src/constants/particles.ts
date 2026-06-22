/**
 * Particle system configuration constants
 */

export const PARTICLE_COLORS = {
  LIGHT: '#94a3b8',
  DARK: '#64748b',
} as const

export const PARTICLE_LINK_OPACITY = {
  LIGHT: 0.4,
  DARK: 0.45,
} as const

export const PARTICLE_CONFIG = {
  FPS_LIMIT: 60,
  LINK_DISTANCE: 160,
  LINK_WIDTH: 1.5,
  PARTICLE_COUNT: 28,
  MOVE_SPEED: 0.3,
  OPACITY_MIN: 0.3,
  OPACITY_MAX: 0.5,
  OPACITY_ANIMATION_SPEED: 0.5,
  SIZE_MIN: 2,
  SIZE_MAX: 3,
  REPULSE_DISTANCE: 120,
  REPULSE_DURATION: 1.5,
  REPULSE_SPEED: 0.3,
} as const
