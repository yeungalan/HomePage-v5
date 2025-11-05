'use client'

import { useEffect } from 'react'
import { addCollection } from '@iconify/react'

export function IconifyConfig() {
  useEffect(() => {
    // Load icon collections from local packages
    const loadIcons = async () => {
      try {
        // Load mingcute icons
        const mingcuteData = await import('@iconify-json/mingcute/icons.json')
        addCollection(mingcuteData.default)
      } catch (error) {
        console.error('Failed to load icon collections:', error)
      }
    }

    loadIcons()
  }, [])

  return null
}
