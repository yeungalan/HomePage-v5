'use client'

import { useEffect } from 'react'
import { addCollection, addIcon } from '@iconify/react'

// Pre-bundled mdi weather icons for offline/local use
const MDI_WEATHER_ICONS: Record<string, { body: string; width?: number; height?: number }> = {
  'weather-sunny': { body: '<path fill="currentColor" d="M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3m0-7l2.39 3.42C13.65 5.15 12.84 5 12 5s-1.65.15-2.39.42zM3.34 7l4.16-.35A7.2 7.2 0 0 0 5.94 8.5c-.44.74-.69 1.5-.83 2.29zm.02 10l1.76-3.77a7.1 7.1 0 0 0 2.38 3.42zm17.3-10l-1.77 3.79a7.023 7.023 0 0 0-2.38-3.44zM20.65 17l-4.16.35a7.2 7.2 0 0 0 1.56-1.85c.44-.74.69-1.5.83-2.29zM12 22l-2.39-3.42c.74.27 1.55.42 2.39.42s1.65-.15 2.39-.42z"/>' },
  'weather-sunset-up': { body: '<path fill="currentColor" d="M3 12h4a5 5 0 0 1 5-5a5 5 0 0 1 5 5h4a1 1 0 0 1 1 1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1a1 1 0 0 1 1-1m9 5l3.22 3.22l-1.42 1.42L12 19.84l-1.8 1.8l-1.42-1.42zm-7.69-3.64l1.42-1.42l1.41 1.42l-1.41 1.41zm14.96 0l1.42-1.42l1.41 1.42l-1.41 1.41zM12 6l-3.22-3.22l1.42-1.42L12 3.16l1.8-1.8l1.42 1.42z"/>' },
  'weather-sunset-down': { body: '<path fill="currentColor" d="M3 12h4a5 5 0 0 1 5-5a5 5 0 0 1 5 5h4a1 1 0 0 1 1 1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1a1 1 0 0 1 1-1m9 5l3.22 3.22l-1.42 1.42L12 19.84l-1.8 1.8l-1.42-1.42zm-7.69-3.64l1.42-1.42l1.41 1.42l-1.41 1.41zm14.96 0l1.42-1.42l1.41 1.42l-1.41 1.41zM12 6l1.8-1.8l1.42 1.42L12 8.84l-3.22-3.22l1.42-1.42z"/>' },
  'weather-night': { body: '<path fill="currentColor" d="M17.75 4.09L15.22 6.03l.16 3.03l-2.89.86l-1.51 2.64l-2.94-.48L6 14.11l.97 2.84l-1.97 2.28l2.53 1.65l.16 3.03l2.94-.49l2.04 2.15l1.83-2.35l2.89.86l1.2-2.8l2.53-1.65l-.98-2.84l1.98-2.28l-2.54-1.94zM12 15a3 3 0 0 1-3-3a3 3 0 0 1 3-3a3 3 0 0 1 3 3a3 3 0 0 1-3 3"/>' },
};

export function IconifyConfig() {
  useEffect(() => {
    const loadIcons = async () => {
      try {
        const mingcuteData = await import('@iconify-json/mingcute/icons.json')
        addCollection(mingcuteData.default)
      } catch (error) {
        console.error('Failed to load icon collections:', error)
      }

      // Register mdi weather icons locally
      for (const [name, data] of Object.entries(MDI_WEATHER_ICONS)) {
        addIcon(`mdi:${name}`, { ...data, width: 24, height: 24 })
      }
    }

    loadIcons()
  }, [])

  return null
}
