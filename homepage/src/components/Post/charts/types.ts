/**
 * Type definitions for the in-post chart system.
 *
 * Charts are authored directly inside a markdown post using a fenced code
 * block tagged with the `chart` language. The body of the block is a JSON
 * document whose `type` field selects which chart to render:
 *
 * ```chart
 * { "type": "line", ... }
 * ```
 *
 * Supported types: `line`, `pie`, `map`.
 */

export type ChartType = 'line' | 'pie' | 'map'

/* ------------------------------------------------------------------ */
/* Line chart                                                          */
/* ------------------------------------------------------------------ */

export interface LineSeries {
  /** Legend name for this series. */
  name?: string
  /** Explicit stroke colour. Falls back to the shared palette. */
  color?: string
  /** Y values aligned to the top-level `labels` array. */
  values?: number[]
  /** Alternative point form. When present, labels are derived from `x`. */
  data?: { x: string | number; y: number }[]
}

export interface LineChartSpec {
  type: 'line'
  title?: string
  /** Axis captions. */
  xLabel?: string
  yLabel?: string
  /** Shared category labels for the x-axis. */
  labels?: (string | number)[]
  series: LineSeries[]
  /** Render a filled area under each line. */
  area?: boolean
  /** Use a smoothed (curved) line instead of straight segments. */
  smooth?: boolean
}

/* ------------------------------------------------------------------ */
/* Pie / donut chart                                                   */
/* ------------------------------------------------------------------ */

export interface PieSlice {
  label: string
  value: number
  color?: string
}

export interface PieChartSpec {
  type: 'pie'
  title?: string
  slices: PieSlice[]
  /** Render with a hollow centre. */
  donut?: boolean
}

/* ------------------------------------------------------------------ */
/* Map chart (Point A -> Point B)                                      */
/* ------------------------------------------------------------------ */

export interface MapPoint {
  name?: string
  lat: number
  lng: number
  color?: string
}

/** A route endpoint is either a named point or inline coordinates. */
export type MapRouteEndpoint = string | { lat: number; lng: number; name?: string }

export interface MapRoute {
  from: MapRouteEndpoint
  to: MapRouteEndpoint
  label?: string
  color?: string
}

export interface MapChartSpec {
  type: 'map'
  title?: string
  points?: MapPoint[]
  routes?: MapRoute[]
  /** Height of the globe canvas in pixels (default 420). */
  height?: number
  /** Whether the globe spins on its own. Defaults to true. */
  autoRotate?: boolean
}

export type ChartSpec = LineChartSpec | PieChartSpec | MapChartSpec
