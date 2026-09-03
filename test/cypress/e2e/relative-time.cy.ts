/**
 * Regression coverage for `relativeTimeFromNow` (src/lib/datetime.ts).
 *
 * This guards against a real bug: something that happened "yesterday" (a
 * fixed calendar date) was rendered as "2 days ago" once more than ~36 hours
 * had elapsed since midnight, because the day count was computed by rounding
 * raw elapsed milliseconds instead of counting calendar-day boundaries.
 *
 * `cy.clock()` freezes `Date`/`setInterval` for the whole page, including the
 * component's own `new Date()` calls, so each case can pin an exact "now"
 * against the fixed reference date rendered by the testComponent/relative-time
 * sandbox page.
 */

const FIXED_DATE = new Date('2026-09-02T00:00:00')

const visitAt = (now: Date) => {
  cy.clock(now, ['Date'])
  cy.visit('/testComponent/relative-time')
}

describe('RelativeTime: calendar-day-aware "days ago" text', () => {
  it('shows "1 day ago" shortly after midnight on the next calendar day', () => {
    // 25h after the reference date: just past the first calendar-day boundary.
    visitAt(new Date('2026-09-03T01:00:00'))
    cy.get('[data-testid="relative-time-default"]').should('contain.text', '1 day ago')
  })

  it('still shows "1 day ago" late in the next calendar day (>36h elapsed) — the reported bug', () => {
    // 47h after the reference date: old (buggy) rounding logic produced "2
    // days ago" here since Math.round(47/24) === 2. Calendar-day counting
    // must still say "1".
    visitAt(new Date('2026-09-03T23:00:00'))
    cy.get('[data-testid="relative-time-default"]').should('contain.text', '1 day ago')
    cy.get('[data-testid="relative-time-default"]').should('not.contain.text', '2 days ago')
  })

  it('rolls over to "2 days ago" only once a second calendar day has passed', () => {
    visitAt(new Date('2026-09-04T01:00:00'))
    cy.get('[data-testid="relative-time-default"]').should('contain.text', '2 days ago')
  })

  it('still reports hours/minutes correctly for same-day elapsed times', () => {
    visitAt(new Date(FIXED_DATE.getTime() + 3 * 60 * 60 * 1000))
    cy.get('[data-testid="relative-time-default"]').should('contain.text', '3 hours ago')
  })

  it('falls back to an absolute date once past displayAbsoluteTimeAfterDay', () => {
    visitAt(new Date('2026-09-05T00:00:00'))
    cy.get('[data-testid="relative-time-absolute-after-1-day"]').should('contain.text', '2026-09-02')
  })
})
