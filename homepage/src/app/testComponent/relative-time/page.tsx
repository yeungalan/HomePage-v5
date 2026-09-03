"use client"

import { RelativeTime } from "@/components/RelativeTime"

// A fixed reference instant. Tests drive "now" with cy.clock() before
// visiting, so the gap between this constant and "now" is fully controlled
// by the test rather than by wall-clock time.
const FIXED_DATE = "2026-09-02T00:00:00"

export default function Page() {
  return (
    <div className="p-8 space-y-4">
      <div data-testid="relative-time-default">
        <RelativeTime date={FIXED_DATE} />
      </div>
      <div data-testid="relative-time-absolute-after-1-day">
        <RelativeTime date={FIXED_DATE} displayAbsoluteTimeAfterDay={1} />
      </div>
    </div>
  )
}
