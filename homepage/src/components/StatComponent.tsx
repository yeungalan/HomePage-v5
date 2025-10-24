'use client'

import { useEffect } from 'react'

export default function StatsComponent() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    const Stats = require('stats.js')
    const stats = new Stats()
    stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
    
    // Style the stats panel
    stats.dom.style.position = 'fixed'
    stats.dom.style.left = 'auto'      // Reset the default left property
    stats.dom.style.right = '0'        // Position on right
    stats.dom.style.top = '0'
    stats.dom.style.zIndex = '9999'
    
    document.body.appendChild(stats.dom)

    function animate() {
      stats.begin()
      // Your rendering code here
      stats.end()
      requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)

    // Cleanup
    return () => {
      document.body.removeChild(stats.dom)
    }
  }, [])

  return null
}