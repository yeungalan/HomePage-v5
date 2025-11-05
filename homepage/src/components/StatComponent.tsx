'use client'

import { useEffect, useState } from 'react'

export default function StatsComponent() {
  const [isEnabled, setIsEnabled] = useState(false)

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    // Check localStorage for initial state
    const savedState = localStorage.getItem('fps-monitor-enabled') === 'true'
    setIsEnabled(savedState)

    // Listen for toggle events
    const handleToggle = (event: CustomEvent) => {
      setIsEnabled(event.detail.enabled)
    }

    window.addEventListener('fps-monitor-toggle', handleToggle as EventListener)

    return () => {
      window.removeEventListener('fps-monitor-toggle', handleToggle as EventListener)
    }
  }, [])

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return
    if (!isEnabled) return

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

    const animationId = requestAnimationFrame(animate)

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId)
      if (stats.dom && stats.dom.parentElement) {
        document.body.removeChild(stats.dom)
      }
    }
  }, [isEnabled])

  return null
}