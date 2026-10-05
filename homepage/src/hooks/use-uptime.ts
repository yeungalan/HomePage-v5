import { useEffect, useState } from 'react'

import {
  fetchUptimeEvents,
  fetchUptimeMonitors,
  type UptimeEvent,
  type UptimeMonitor,
} from '@/lib/uptime'

const REFRESH_MS = 60_000

interface UptimeMonitorsState {
  monitors: Map<number, UptimeMonitor> | null
  updatedAt: Date | null
  failed: boolean
}

/** Every monitor on an UptimeRobot status page, refreshed once a minute. */
export const useUptimeMonitors = (pageId: string): UptimeMonitorsState => {
  const [state, setState] = useState<UptimeMonitorsState>({ monitors: null, updatedAt: null, failed: false })

  useEffect(() => {
    let controller = new AbortController()
    const load = () => {
      controller.abort()
      const request = new AbortController()
      controller = request
      fetchUptimeMonitors(pageId, request.signal)
        .then((monitors) => setState({ monitors, updatedAt: new Date(), failed: false }))
        .catch((error: unknown) => {
          if (request.signal.aborted) return
          console.warn('Could not load uptime data', error)
          // Keep the last good data on screen; only flag the failure.
          setState((prev) => ({ ...prev, failed: true }))
        })
    }
    load()
    const timer = setInterval(load, REFRESH_MS)
    return () => {
      clearInterval(timer)
      controller.abort()
    }
  }, [pageId])

  return state
}

interface UptimeEventsState {
  monitorId: number | undefined
  events: UptimeEvent[] | null
  failed: boolean
}

/** Recent up/down events for one monitor; `undefined` skips loading. */
export const useUptimeEvents = (pageId: string, monitorId: number | undefined, limit = 5) => {
  const [state, setState] = useState<UptimeEventsState>({ monitorId: undefined, events: null, failed: false })

  useEffect(() => {
    if (monitorId === undefined) return
    const controller = new AbortController()
    fetchUptimeEvents(pageId, monitorId, limit, controller.signal)
      .then((events) => setState({ monitorId, events, failed: false }))
      .catch(() => {
        if (!controller.signal.aborted) setState({ monitorId, events: null, failed: true })
      })
    return () => controller.abort()
  }, [pageId, monitorId, limit])

  // Results for a previously selected monitor count as still loading.
  const current = state.monitorId === monitorId
  return {
    events: current ? state.events : null,
    failed: current && state.failed,
  }
}
