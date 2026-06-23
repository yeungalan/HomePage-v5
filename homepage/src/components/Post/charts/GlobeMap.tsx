'use client'

import React, { useEffect, useMemo, useRef } from 'react'
import Globe from 'react-globe.gl'

export interface ResolvedPoint {
  name: string
  lat: number
  lng: number
  color: string
}

export interface ResolvedArc {
  startLat: number
  startLng: number
  endLat: number
  endLng: number
  color: string
  label: string
}

interface GlobeMapProps {
  points: ResolvedPoint[]
  arcs: ResolvedArc[]
  width: number
  height: number
}

// Minimal structural type for the bits of the globe instance we touch.
interface GlobeInstance {
  pointOfView: (pov?: { lat?: number; lng?: number; altitude?: number }, ms?: number) => void
  controls: () => { autoRotate: boolean; autoRotateSpeed: number; enableZoom: boolean }
}

/**
 * Pick a camera altitude that frames every point. Tight clusters zoom in,
 * far-flung points (e.g. trans-pacific routes) zoom out.
 */
function computeAltitude(points: ResolvedPoint[]): number {
  if (points.length < 2) return 2
  let maxLat = -90,
    minLat = 90,
    maxLng = -180,
    minLng = 180
  for (const p of points) {
    maxLat = Math.max(maxLat, p.lat)
    minLat = Math.min(minLat, p.lat)
    maxLng = Math.max(maxLng, p.lng)
    minLng = Math.min(minLng, p.lng)
  }
  const spread = Math.max(maxLat - minLat, maxLng - minLng)
  // Map a 0-180° spread onto a sensible altitude range.
  return Math.min(3.2, Math.max(1.2, 0.6 + spread / 45))
}

export default function GlobeMap({ points, arcs, width, height }: GlobeMapProps) {
  const globeRef = useRef<GlobeInstance | null>(null)

  const center = useMemo(() => {
    if (points.length === 0) return { lat: 20, lng: 0 }
    const lat = points.reduce((s, p) => s + p.lat, 0) / points.length
    const lng = points.reduce((s, p) => s + p.lng, 0) / points.length
    return { lat, lng }
  }, [points])

  useEffect(() => {
    const globe = globeRef.current
    if (!globe) return
    globe.pointOfView(
      { lat: center.lat, lng: center.lng, altitude: computeAltitude(points) },
      1000,
    )
    const controls = globe.controls()
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.4
    controls.enableZoom = true
  }, [center, points])

  return (
    <Globe
      ref={globeRef}
      width={width}
      height={height}
      backgroundColor="rgba(0,0,0,0)"
      globeImageUrl="/assets/images/day.jpg"
      atmosphereColor="#9ec5ff"
      atmosphereAltitude={0.18}
      // Route arcs (Point A -> Point B)
      arcsData={arcs}
      arcStartLat="startLat"
      arcStartLng="startLng"
      arcEndLat="endLat"
      arcEndLng="endLng"
      arcColor={(d: object) => (d as ResolvedArc).color}
      arcLabel={(d: object) => (d as ResolvedArc).label}
      arcStroke={0.6}
      arcDashLength={0.4}
      arcDashGap={0.2}
      arcDashAnimateTime={2000}
      arcAltitudeAutoScale={0.4}
      // Named locations
      labelsData={points}
      labelLat="lat"
      labelLng="lng"
      labelText={(d: object) => (d as ResolvedPoint).name}
      labelColor={(d: object) => (d as ResolvedPoint).color}
      labelDotRadius={0.4}
      labelSize={1.1}
      labelResolution={2}
      pointsData={points}
      pointLat="lat"
      pointLng="lng"
      pointColor={(d: object) => (d as ResolvedPoint).color}
      pointAltitude={0.01}
      pointRadius={0.35}
      pointLabel={(d: object) => (d as ResolvedPoint).name}
    />
  )
}
