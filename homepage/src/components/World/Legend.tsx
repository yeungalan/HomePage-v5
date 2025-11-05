/**
 * Legend component for World visualization
 */

import React from 'react'
import { motion } from 'framer-motion'
import { POINT_COLORS, ROUTE_COLORS } from '@/constants/world'

interface LegendProps {
  globeMaterial: unknown
}

export const Legend: React.FC<LegendProps> = ({ globeMaterial }) => {
  return (
    <motion.div
      className="fixed left-4 top-20 text-white font-mono text-xs bg-black/50 px-3 py-2 rounded backdrop-blur-sm z-10 hidden md:block"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: globeMaterial ? 1 : 0, y: globeMaterial ? 0 : -20 }}
      transition={{
        duration: 0.8,
        delay: 0.5,
        ease: 'easeOut',
      }}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span>Airports</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: POINT_COLORS.TRAIN }}
          ></div>
          <span>Train Stations</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: POINT_COLORS.OVERLAP }}
          ></div>
          <span>Both (Airport & Train/Car)</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: POINT_COLORS.CLUSTER_BOTH }}
          ></div>
          <span>Clustered Locations</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-white"></div>
          <span>Flight Routes</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-0.5"
            style={{ backgroundColor: ROUTE_COLORS.TRAIN }}
          ></div>
          <span>Train/Car Routes</span>
        </div>
      </div>
    </motion.div>
  )
}
