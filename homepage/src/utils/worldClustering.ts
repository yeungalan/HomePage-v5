/**
 * Clustering utilities for World component
 */

import { CLUSTERING_CONFIG } from '@/constants/world'

export interface Point {
  lat: string
  lng: string
  type: 'airport' | 'train' | 'overlap'
  name?: string
  city?: string
  routes?: string[]
  flightRoutes?: string[]
}

export interface ClusteredPoint extends Point {
  type: 'cluster' | 'cluster-both' | 'cluster-airport' | 'cluster-train' | 'airport' | 'train' | 'overlap'
  clusterSize?: number
  airportCount?: number
  trainCount?: number
  names?: string[]
  originalPoints?: Point[]
  trainRoutes?: string[]
}

/**
 * Calculate great circle distance between two lat/lng points in kilometers
 */
export const haversineDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Determine clustering threshold based on altitude
 */
const getClusterThreshold = (altitude: number): number => {
  if (altitude < CLUSTERING_CONFIG.NO_CLUSTER_ALTITUDE) {
    return 0 // No clustering
  } else if (altitude < CLUSTERING_CONFIG.LIGHT_CLUSTER_ALTITUDE) {
    return CLUSTERING_CONFIG.LIGHT_CLUSTER_KM
  } else if (altitude < CLUSTERING_CONFIG.MEDIUM_CLUSTER_ALTITUDE) {
    return CLUSTERING_CONFIG.MEDIUM_CLUSTER_KM
  } else if (altitude < CLUSTERING_CONFIG.HEAVY_CLUSTER_ALTITUDE) {
    return CLUSTERING_CONFIG.HEAVY_CLUSTER_KM
  } else {
    return CLUSTERING_CONFIG.MAX_CLUSTER_KM
  }
}

/**
 * Cluster points based on altitude (zoom level)
 * Returns merged points when zoomed out
 */
export const clusterPoints = (points: Point[], altitude: number): ClusteredPoint[] => {
  const clusterThresholdKm = getClusterThreshold(altitude)

  // No clustering needed
  if (clusterThresholdKm === 0) {
    return points as ClusteredPoint[]
  }

  const clustered: ClusteredPoint[] = []
  const used = new Set<number>()

  points.forEach((point, i) => {
    if (used.has(i)) return

    const cluster = [point]
    used.add(i)

    // Find all nearby points
    for (let j = i + 1; j < points.length; j++) {
      if (used.has(j)) continue

      const other = points[j]
      const distance = haversineDistance(
        parseFloat(point.lat),
        parseFloat(point.lng),
        parseFloat(other.lat),
        parseFloat(other.lng)
      )

      if (distance <= clusterThresholdKm) {
        cluster.push(other)
        used.add(j)
      }
    }

    if (cluster.length === 1) {
      // No clustering needed
      clustered.push(point as ClusteredPoint)
    } else {
      // Merge multiple points
      const avgLat = cluster.reduce((sum, p) => sum + parseFloat(p.lat), 0) / cluster.length
      const avgLng = cluster.reduce((sum, p) => sum + parseFloat(p.lng), 0) / cluster.length

      // Separate by type
      const airports = cluster.filter((p) => p.type === 'airport' || p.type === 'overlap')
      const trainStations = cluster.filter((p) => p.type === 'train' || p.type === 'overlap')

      // Count unique items
      const airportCount = airports.length
      const trainCount = trainStations.length
      const hasAirports = airportCount > 0
      const hasTrains = trainCount > 0

      // Determine type
      let mergedType: ClusteredPoint['type'] = 'cluster'
      if (hasAirports && hasTrains) {
        mergedType = 'cluster-both'
      } else if (hasAirports) {
        mergedType = 'cluster-airport'
      } else if (hasTrains) {
        mergedType = 'cluster-train'
      }

      // Gather names
      const names = cluster
        .map((p) => p.name || p.city)
        .filter((v, i, a) => a.indexOf(v) === i) // unique
        .filter((name): name is string => name !== undefined)
        .slice(0, 5) // limit to first 5

      // Aggregate flight routes from all airports in cluster
      const allFlightRoutes = new Set<string>()
      airports.forEach((airport) => {
        if (airport.flightRoutes) {
          airport.flightRoutes.forEach((route) => allFlightRoutes.add(route))
        }
      })

      // Aggregate train routes from all train stations in cluster
      const allTrainRoutes = new Set<string>()
      trainStations.forEach((station) => {
        if (station.routes) {
          station.routes.forEach((route) => allTrainRoutes.add(route))
        }
      })

      clustered.push({
        lat: avgLat.toString(),
        lng: avgLng.toString(),
        type: mergedType,
        clusterSize: cluster.length,
        airportCount,
        trainCount,
        names,
        originalPoints: cluster,
        flightRoutes: Array.from(allFlightRoutes),
        trainRoutes: Array.from(allTrainRoutes),
      })
    }
  })

  return clustered
}
