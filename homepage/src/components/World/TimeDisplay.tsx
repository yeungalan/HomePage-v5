/**
 * Time display component for World visualization
 */

import React from 'react'
import { motion } from 'framer-motion'

interface TimeDisplayProps {
  dt: number
  globeMaterial: unknown
}

export const TimeDisplay: React.FC<TimeDisplayProps> = ({ dt, globeMaterial }) => {
  return (
    <motion.div
      className="fixed left-4 bottom-4 text-sky-300 font-mono text-sm sm:text-base bg-black/50 px-3 py-2 rounded backdrop-blur-sm z-10 hidden md:block"
      style={{
        bottom: 'max(1rem, calc(env(safe-area-inset-bottom) + 1rem))',
        left: 'max(1rem, calc(env(safe-area-inset-left) + 1rem))',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: globeMaterial ? 1 : 0, y: globeMaterial ? 0 : 20 }}
      transition={{
        duration: 0.8,
        delay: 0.3,
        ease: 'easeOut',
      }}
    >
      {new Date(dt).toLocaleString()}
    </motion.div>
  )
}
