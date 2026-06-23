import React from 'react'
import type { PieChartSpec } from './types'
import { paletteColor } from './palette'

const SIZE = 320
const R = 130
const CX = SIZE / 2
const CY = SIZE / 2

/** Convert a polar coordinate (angle in radians) to an SVG x/y on the circle. */
function polar(cx: number, cy: number, r: number, angle: number): [number, number] {
  return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)]
}

/** SVG arc path for a slice spanning [start, end] radians. */
function arcPath(start: number, end: number, r: number, innerR: number): string {
  const largeArc = end - start > Math.PI ? 1 : 0
  const [x0, y0] = polar(CX, CY, r, start)
  const [x1, y1] = polar(CX, CY, r, end)

  if (innerR <= 0) {
    return `M${CX},${CY} L${x0},${y0} A${r},${r} 0 ${largeArc} 1 ${x1},${y1} Z`
  }
  const [ix1, iy1] = polar(CX, CY, innerR, end)
  const [ix0, iy0] = polar(CX, CY, innerR, start)
  return (
    `M${x0},${y0} A${r},${r} 0 ${largeArc} 1 ${x1},${y1}` +
    ` L${ix1},${iy1} A${innerR},${innerR} 0 ${largeArc} 0 ${ix0},${iy0} Z`
  )
}

export const PieChart: React.FC<{ spec: PieChartSpec }> = ({ spec }) => {
  const slices = (Array.isArray(spec.slices) ? spec.slices : []).filter(
    (s) => typeof s.value === 'number' && s.value > 0,
  )
  const total = slices.reduce((sum, s) => sum + s.value, 0)

  if (slices.length === 0 || total <= 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Pie chart has no positive values to display.
      </p>
    )
  }

  const innerR = spec.donut ? R * 0.58 : 0
  // Start at the top (12 o'clock) and sweep clockwise.
  let angle = -Math.PI / 2

  const rendered = slices.map((slice, i) => {
    const fraction = slice.value / total
    const start = angle
    const end = angle + fraction * Math.PI * 2
    angle = end
    const color = slice.color ?? paletteColor(i)
    const mid = (start + end) / 2
    const [lx, ly] = polar(CX, CY, R * 0.7, mid)
    return { slice, start, end, color, fraction, labelPos: [lx, ly] as const }
  })

  return (
    <figure className="not-prose my-6">
      {spec.title && (
        <figcaption className="mb-2 text-center text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          {spec.title}
        </figcaption>
      )}
      <div className="flex w-full flex-col items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/40 sm:flex-row sm:justify-center sm:gap-8">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="h-56 w-56 shrink-0"
          role="img"
          aria-label={spec.title ?? 'Pie chart'}
        >
          {rendered.map(({ slice, start, end, color, fraction, labelPos }, i) => (
            <g key={i}>
              <path
                d={arcPath(start, end, R, innerR)}
                fill={color}
                stroke="white"
                strokeWidth={2}
                className="dark:[stroke:#18181b]"
              >
                <title>{`${slice.label}: ${slice.value} (${(fraction * 100).toFixed(1)}%)`}</title>
              </path>
              {fraction >= 0.06 && (
                <text
                  x={labelPos[0]}
                  y={labelPos[1]}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none fill-white text-[12px] font-semibold"
                >
                  {`${Math.round(fraction * 100)}%`}
                </text>
              )}
            </g>
          ))}
          {spec.donut && (
            <text
              x={CX}
              y={CY}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-zinc-700 text-[18px] font-bold dark:fill-zinc-100"
            >
              {total}
            </text>
          )}
        </svg>

        <ul className="flex flex-col gap-1.5">
          {rendered.map(({ slice, color, fraction }, i) => (
            <li
              key={i}
              className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300"
            >
              <span
                className="inline-block h-3 w-3 shrink-0 rounded-sm"
                style={{ backgroundColor: color }}
                aria-hidden
              />
              <span className="font-medium text-zinc-700 dark:text-zinc-200">
                {slice.label}
              </span>
              <span className="text-zinc-400">
                {slice.value} ({(fraction * 100).toFixed(1)}%)
              </span>
            </li>
          ))}
        </ul>
      </div>
    </figure>
  )
}
