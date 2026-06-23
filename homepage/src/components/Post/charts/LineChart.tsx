import React, { useMemo } from 'react'
import type { LineChartSpec } from './types'
import { paletteColor } from './palette'

interface NormalizedSeries {
  name?: string
  color?: string
  values: (number | null)[]
}

/** Compute a "nice" rounded step for axis ticks. */
function niceStep(range: number, targetTicks: number): number {
  if (range <= 0 || !Number.isFinite(range)) return 1
  const rough = range / Math.max(1, targetTicks)
  const pow = Math.pow(10, Math.floor(Math.log10(rough)))
  const candidates = [1, 2, 2.5, 5, 10].map((m) => m * pow)
  return candidates.find((c) => c >= rough) ?? candidates[candidates.length - 1]
}

/** Build an SVG path. When smooth, use a Catmull-Rom -> cubic Bézier curve. */
function buildLinePath(points: [number, number][], smooth: boolean): string {
  if (points.length === 0) return ''
  if (points.length < 3 || !smooth) {
    return points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ')
  }
  let d = `M${points[0][0]},${points[0][1]}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1]
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`
  }
  return d
}

const WIDTH = 760
const HEIGHT = 380
const M = { top: 24, right: 24, bottom: 56, left: 56 }

export const LineChart: React.FC<{ spec: LineChartSpec }> = ({ spec }) => {
  const { labels, series } = useMemo(() => {
    const rawSeries = Array.isArray(spec.series) ? spec.series : []

    // Derive labels: explicit `labels` win, otherwise pull x from the longest
    // `data` array among the series.
    let labels: (string | number)[] = spec.labels ?? []
    if (labels.length === 0) {
      const longest = rawSeries.reduce<typeof rawSeries[number] | undefined>(
        (best, s) =>
          (s.data?.length ?? 0) > (best?.data?.length ?? 0) ? s : best,
        undefined,
      )
      labels = longest?.data?.map((d) => d.x) ?? []
    }

    const series: NormalizedSeries[] = rawSeries.map((s) => ({
      name: s.name,
      color: s.color,
      values: s.values
        ? s.values.map((v) => (typeof v === 'number' ? v : null))
        : labels.map((label) => {
            const match = s.data?.find((d) => String(d.x) === String(label))
            return match ? match.y : null
          }),
    }))

    return { labels, series }
  }, [spec])

  const numeric = series.flatMap((s) =>
    s.values.filter((v): v is number => typeof v === 'number'),
  )

  if (labels.length === 0 || numeric.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Line chart has no plottable data.
      </p>
    )
  }

  const dataMin = Math.min(...numeric)
  const dataMax = Math.max(...numeric)
  // Pad the domain a little and start at 0 when the data is all positive.
  const lo = dataMin >= 0 ? 0 : dataMin
  const step = niceStep(dataMax - lo, 5)
  const yMin = Math.floor(lo / step) * step
  const yMax = Math.ceil(dataMax / step) * step || step

  const plotW = WIDTH - M.left - M.right
  const plotH = HEIGHT - M.top - M.bottom

  const xAt = (i: number) =>
    M.left + (labels.length === 1 ? plotW / 2 : (i / (labels.length - 1)) * plotW)
  const yAt = (v: number) =>
    M.top + plotH - ((v - yMin) / (yMax - yMin || 1)) * plotH

  const ticks: number[] = []
  for (let v = yMin; v <= yMax + 1e-9; v += step) ticks.push(Number(v.toFixed(6)))

  // Avoid cramming every category label when there are many points.
  const labelStride = Math.ceil(labels.length / 12)

  const showLegend = series.some((s) => s.name) && series.length > 1

  return (
    <figure className="not-prose my-6">
      {spec.title && (
        <figcaption className="mb-2 text-center text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          {spec.title}
        </figcaption>
      )}
      <div className="w-full overflow-hidden rounded-xl border border-zinc-200 bg-white p-3 text-zinc-600 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-300">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-auto w-full"
          role="img"
          aria-label={spec.title ?? 'Line chart'}
        >
          {/* Horizontal grid lines + y tick labels */}
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={M.left}
                x2={WIDTH - M.right}
                y1={yAt(t)}
                y2={yAt(t)}
                className="stroke-zinc-200 dark:stroke-zinc-700"
                strokeWidth={1}
              />
              <text
                x={M.left - 8}
                y={yAt(t)}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-current text-[11px]"
              >
                {t}
              </text>
            </g>
          ))}

          {/* x axis labels */}
          {labels.map((label, i) =>
            i % labelStride === 0 ? (
              <text
                key={i}
                x={xAt(i)}
                y={HEIGHT - M.bottom + 18}
                textAnchor="middle"
                className="fill-current text-[11px]"
              >
                {String(label)}
              </text>
            ) : null,
          )}

          {/* Axis captions */}
          {spec.yLabel && (
            <text
              transform={`translate(14 ${M.top + plotH / 2}) rotate(-90)`}
              textAnchor="middle"
              className="fill-current text-[11px] font-medium"
            >
              {spec.yLabel}
            </text>
          )}
          {spec.xLabel && (
            <text
              x={M.left + plotW / 2}
              y={HEIGHT - 8}
              textAnchor="middle"
              className="fill-current text-[11px] font-medium"
            >
              {spec.xLabel}
            </text>
          )}

          {/* Series */}
          {series.map((s, si) => {
            const color = s.color ?? paletteColor(si)
            // Group into contiguous segments so gaps (null) break the line.
            const segments: [number, number][][] = []
            let current: [number, number][] = []
            s.values.forEach((v, i) => {
              if (typeof v === 'number') {
                current.push([xAt(i), yAt(v)])
              } else if (current.length) {
                segments.push(current)
                current = []
              }
            })
            if (current.length) segments.push(current)

            return (
              <g key={si}>
                {spec.area &&
                  segments.map((seg, idx) => {
                    const area =
                      buildLinePath(seg, !!spec.smooth) +
                      ` L${seg[seg.length - 1][0]},${M.top + plotH}` +
                      ` L${seg[0][0]},${M.top + plotH} Z`
                    return (
                      <path
                        key={idx}
                        d={area}
                        fill={color}
                        fillOpacity={0.12}
                        stroke="none"
                      />
                    )
                  })}
                {segments.map((seg, idx) => (
                  <path
                    key={idx}
                    d={buildLinePath(seg, !!spec.smooth)}
                    fill="none"
                    stroke={color}
                    strokeWidth={2.5}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                ))}
                {s.values.map((v, i) =>
                  typeof v === 'number' ? (
                    <circle
                      key={i}
                      cx={xAt(i)}
                      cy={yAt(v)}
                      r={3}
                      fill={color}
                      stroke="white"
                      strokeWidth={1}
                    >
                      <title>{`${s.name ? s.name + ': ' : ''}${labels[i]} = ${v}`}</title>
                    </circle>
                  ) : null,
                )}
              </g>
            )
          })}
        </svg>

        {showLegend && (
          <ul className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
            {series.map((s, si) => (
              <li
                key={si}
                className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300"
              >
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: s.color ?? paletteColor(si) }}
                  aria-hidden
                />
                {s.name ?? `Series ${si + 1}`}
              </li>
            ))}
          </ul>
        )}
      </div>
    </figure>
  )
}
