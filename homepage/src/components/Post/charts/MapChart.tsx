'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { Icon } from '@iconify/react'
import type { MapChartSpec, MapRouteEndpoint } from './types'
import { paletteColor } from './palette'
import type { ResolvedArc, ResolvedPoint } from './GlobeMap'

const GlobeMap = dynamic(() => import('./GlobeMap'), {
  ssr: false,
  loading: () => <GlobeFallback />,
})

const DEFAULT_POINT_COLOR = '#ffd54a'

function GlobeFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center text-sm text-zinc-400">
      Loading map…
    </div>
  )
}

export const MapChart: React.FC<{ spec: MapChartSpec }> = ({ spec }) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [width, setWidth] = useState(0)
  const [rotating, setRotating] = useState(spec.autoRotate ?? true)
  const height = spec.height ?? 420

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => setWidth(el.clientWidth)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const { points, arcs, routeList } = useMemo(() => {
    const rawPoints = Array.isArray(spec.points) ? spec.points : []
    const rawRoutes = Array.isArray(spec.routes) ? spec.routes : []

    const points: ResolvedPoint[] = rawPoints
      .filter((p) => typeof p.lat === 'number' && typeof p.lng === 'number')
      .map((p) => ({
        name: p.name ?? '',
        lat: p.lat,
        lng: p.lng,
        color: p.color ?? DEFAULT_POINT_COLOR,
      }))

    const byName = new Map<string, ResolvedPoint>()
    points.forEach((p) => p.name && byName.set(p.name, p))

    const ensurePoint = (
      ep: MapRouteEndpoint,
    ): { lat: number; lng: number; name: string } | null => {
      if (typeof ep === 'string') {
        const found = byName.get(ep)
        return found ? { lat: found.lat, lng: found.lng, name: found.name } : null
      }
      if (ep && typeof ep.lat === 'number' && typeof ep.lng === 'number') {
        const name = ep.name ?? ''
        // Surface inline endpoints on the globe too.
        if (!points.some((p) => p.lat === ep.lat && p.lng === ep.lng)) {
          const added = { name, lat: ep.lat, lng: ep.lng, color: DEFAULT_POINT_COLOR }
          points.push(added)
          if (name) byName.set(name, added)
        }
        return { lat: ep.lat, lng: ep.lng, name }
      }
      return null
    }

    const arcs: ResolvedArc[] = []
    const routeList: { label: string; color: string }[] = []
    rawRoutes.forEach((route, i) => {
      const from = ensurePoint(route.from)
      const to = ensurePoint(route.to)
      if (!from || !to) return
      const color = route.color ?? paletteColor(i)
      const label = route.label ?? `${from.name || 'A'} → ${to.name || 'B'}`
      arcs.push({
        startLat: from.lat,
        startLng: from.lng,
        endLat: to.lat,
        endLng: to.lng,
        color,
        label,
      })
      routeList.push({ label, color })
    })

    return { points, arcs, routeList }
  }, [spec])

  if (points.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Map chart needs at least one point with latitude and longitude.
      </p>
    )
  }

  return (
    <figure className="not-prose my-6">
      {spec.title && (
        <figcaption className="mb-2 text-center text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          {spec.title}
        </figcaption>
      )}
      <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-gradient-to-b from-slate-900 to-black shadow-sm dark:border-zinc-700">
        <div ref={containerRef} className="w-full" style={{ height }}>
          {width > 0 && (
            <GlobeMap
              points={points}
              arcs={arcs}
              width={width}
              height={height}
              autoRotate={rotating}
            />
          )}
        </div>

        {/* Interactive rotation toggle */}
        <button
          type="button"
          onClick={() => setRotating((r) => !r)}
          className="absolute right-2 top-2 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/70"
          aria-pressed={rotating}
          title={rotating ? 'Pause rotation' : 'Auto-rotate'}
        >
          <Icon icon={rotating ? 'mdi:pause' : 'mdi:play'} className="text-base" />
          {rotating ? 'Pause' : 'Rotate'}
        </button>
      </div>

      {routeList.length > 0 && (
        <ul className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
          {routeList.map((r, i) => (
            <li
              key={i}
              className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300"
            >
              <span
                className="inline-block h-0.5 w-4 rounded-full"
                style={{ backgroundColor: r.color }}
                aria-hidden
              />
              {r.label}
            </li>
          ))}
        </ul>
      )}
    </figure>
  )
}
