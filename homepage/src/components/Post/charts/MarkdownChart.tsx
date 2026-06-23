import React from 'react'
import type { ChartSpec } from './types'
import { LineChart } from './LineChart'
import { PieChart } from './PieChart'
import { MapChart } from './MapChart'

interface MarkdownChartProps {
  /** Raw JSON source extracted from the ```chart fenced code block. */
  source: string
}

function ChartError({ message, source }: { message: string; source: string }) {
  return (
    <div className="not-prose my-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm dark:border-red-900/60 dark:bg-red-950/30">
      <p className="font-semibold text-red-700 dark:text-red-300">
        Chart could not be rendered
      </p>
      <p className="mt-1 text-red-600 dark:text-red-400">{message}</p>
      <pre className="mt-2 max-w-full overflow-x-auto rounded-lg bg-red-100/70 p-2 text-xs text-red-800 dark:bg-red-900/30 dark:text-red-200">
        {source.trim()}
      </pre>
    </div>
  )
}

/**
 * Parses the JSON body of a ```chart code block and renders the chart that
 * matches its `type` field. Invalid JSON or an unknown type degrades to a
 * readable error box rather than crashing the post.
 */
export const MarkdownChart: React.FC<MarkdownChartProps> = ({ source }) => {
  let spec: ChartSpec
  try {
    spec = JSON.parse(source)
  } catch (error) {
    return (
      <ChartError
        message={`Invalid JSON: ${(error as Error).message}`}
        source={source}
      />
    )
  }

  if (!spec || typeof spec !== 'object') {
    return <ChartError message="Chart definition must be a JSON object." source={source} />
  }

  switch (spec.type) {
    case 'line':
      return <LineChart spec={spec} />
    case 'pie':
      return <PieChart spec={spec} />
    case 'map':
      return <MapChart spec={spec} />
    default:
      return (
        <ChartError
          message={`Unknown chart type "${
            (spec as { type?: string }).type ?? ''
          }". Expected "line", "pie", or "map".`}
          source={source}
        />
      )
  }
}
