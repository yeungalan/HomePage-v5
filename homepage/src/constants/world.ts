/**
 * World component constants
 */

// Globe configuration
export const GLOBE_CONFIG = {
  COUNTRY: 'United States',
  OPACITY: 1,
  VELOCITY: 1, // minutes per frame
  INITIAL_LAT: 39.6,
  INITIAL_LNG: -98.5,
  INITIAL_ALTITUDE: 2,
  ANIMATION_DURATION: 6000, // milliseconds
} as const

// Altitude constraints
export const ALTITUDE_LIMITS = {
  MIN: 0.5,
  MAX: 4,
} as const

// Clustering thresholds based on altitude
export const CLUSTERING_CONFIG = {
  NO_CLUSTER_ALTITUDE: 1.5,
  LIGHT_CLUSTER_ALTITUDE: 2,
  MEDIUM_CLUSTER_ALTITUDE: 2.5,
  HEAVY_CLUSTER_ALTITUDE: 3,
  LIGHT_CLUSTER_KM: 50,
  MEDIUM_CLUSTER_KM: 100,
  HEAVY_CLUSTER_KM: 200,
  MAX_CLUSTER_KM: 300,
} as const

// Overlap detection
export const OVERLAP_THRESHOLD_DEGREES = 0.01 // degrees (~1km)

// Point radius configuration
export const POINT_RADIUS = {
  BASE_ZOOMED_IN: 0.15,
  BASE_ZOOMED_OUT: 0.5,
  ZOOM_THRESHOLD: 1,
} as const

// Colors for different point types
export const POINT_COLORS = {
  AIRPORT: 'orange',
  TRAIN: '#00ff88',
  OVERLAP: '#8B4513', // Brown
  CLUSTER_BOTH: '#FFD700', // Gold
  CLUSTER_AIRPORT: '#FFA500', // Orange
  CLUSTER_TRAIN: '#00ff88', // Green
} as const

// Route colors
export const ROUTE_COLORS = {
  FLIGHT: 'rgba(255, 255, 255, 1)',
  TRAIN: '#00ff88',
} as const

// Time mode button positions (in pixels)
export const TIME_MODE_POSITIONS = {
  paused: 4,
  realtime: 36,
  animated: 68,
} as const
