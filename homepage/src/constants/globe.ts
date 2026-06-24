/** Arc opacity for flight routes */
export const ROUTE_ARC_OPACITY = 1;

/** Animation speed in minutes per frame for day/night shader */
export const GLOBE_ANIMATION_VELOCITY = 1;

/** Minimum lat/lng delta treated as the same location (~1 km) */
export const OVERLAP_THRESHOLD_DEGREES = 0.01;

export const CLUSTER_THRESHOLDS = {
  MIN_ALTITUDE_FOR_CLUSTERING: 1.5,
  LIGHT_CLUSTERING_KM: 50,
  MEDIUM_CLUSTERING_KM: 100,
  HEAVY_CLUSTERING_KM: 200,
  MAX_CLUSTERING_KM: 300,
} as const;

export const ALTITUDE_LEVELS = {
  LIGHT: 2,
  MEDIUM: 2.5,
  HEAVY: 3,
} as const;

export const GLOBE_CONFIG = {
  MIN_ALTITUDE: 0.5,
  MAX_ALTITUDE: 4,
  DEFAULT_ALTITUDE: 2.5,
  INITIAL_LATITUDE: 39.6,
  INITIAL_LONGITUDE: -98.5,
  INITIAL_ANIMATION_DURATION: 6000,
} as const;
