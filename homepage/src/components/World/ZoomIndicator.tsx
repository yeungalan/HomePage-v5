/**
 * Zoom indicator and route toggle component for World visualization
 */

import React from 'react'
import { motion } from 'framer-motion'
import { Icon } from '@iconify/react'
import { CLUSTERING_CONFIG } from '@/constants/world'

interface ZoomIndicatorProps {
  altitude: number
  showFlightRoutes: boolean
  showTrainRoutes: boolean
  onToggleFlightRoutes: () => void
  onToggleTrainRoutes: () => void
  globeMaterial: unknown
}

const getClusteringDescription = (altitude: number): string => {
  if (altitude < CLUSTERING_CONFIG.NO_CLUSTER_ALTITUDE) {
    return 'Individual points'
  } else if (altitude < CLUSTERING_CONFIG.LIGHT_CLUSTER_ALTITUDE) {
    return `Light clustering (${CLUSTERING_CONFIG.LIGHT_CLUSTER_KM}km)`
  } else if (altitude < CLUSTERING_CONFIG.MEDIUM_CLUSTER_ALTITUDE) {
    return `Medium clustering (${CLUSTERING_CONFIG.MEDIUM_CLUSTER_KM}km)`
  } else if (altitude < CLUSTERING_CONFIG.HEAVY_CLUSTER_ALTITUDE) {
    return `Heavy clustering (${CLUSTERING_CONFIG.HEAVY_CLUSTER_KM}km)`
  } else {
    return `Max clustering (${CLUSTERING_CONFIG.MAX_CLUSTER_KM}km+)`
  }
}

export const ZoomIndicator: React.FC<ZoomIndicatorProps> = ({
  altitude,
  showFlightRoutes,
  showTrainRoutes,
  onToggleFlightRoutes,
  onToggleTrainRoutes,
  globeMaterial,
}) => {
  return (
    <motion.div
      className="fixed right-4 top-20 text-white font-mono text-xs bg-black/50 px-3 py-2 rounded backdrop-blur-sm z-10 hidden md:block"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: globeMaterial ? 1 : 0, y: globeMaterial ? 0 : -20 }}
      transition={{
        duration: 0.8,
        delay: 0.7,
        ease: 'easeOut',
      }}
    >
      <div className="flex flex-col gap-2">
        <div>Altitude: {altitude.toFixed(2)}</div>
        <div className="text-xs text-gray-400">{getClusteringDescription(altitude)}</div>

        {/* Route Toggle Controls */}
        <div className="border-t border-gray-600 pt-2 mt-1 flex flex-col gap-2">
          <button
            onClick={onToggleFlightRoutes}
            className="flex items-center gap-2 px-2 py-1 rounded transition-colors hover:bg-white/10"
            style={{
              backgroundColor: showFlightRoutes ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              opacity: showFlightRoutes ? 1 : 0.5,
            }}
          >
            <Icon
              icon={showFlightRoutes ? 'mdi:airplane' : 'mdi:airplane-off'}
              className="text-base"
            />
            <span className="text-xs">Flight Routes</span>
          </button>

          <button
            onClick={onToggleTrainRoutes}
            className="flex items-center gap-2 px-2 py-1 rounded transition-colors hover:bg-white/10"
            style={{
              backgroundColor: showTrainRoutes ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              opacity: showTrainRoutes ? 1 : 0.5,
            }}
          >
            <Icon
              icon={showTrainRoutes ? 'mdi:train' : 'mdi:train-off'}
              className="text-base"
            />
            <span className="text-xs">Train/Car Routes</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}
