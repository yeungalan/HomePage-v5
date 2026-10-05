/**
 * The /arch flow chart takes each service's live status and uptime from the
 * public UptimeRobot status page (homepage/src/lib/uptime.ts). The API is
 * stubbed here so the assertions don't depend on the real monitors.
 */

const LIST = { hostname: 'stats.uptimerobot.com', pathname: '/api/getMonitorList/JKvyVhBqBO' }
const DETAIL = { hostname: 'stats.uptimerobot.com', pathname: '/api/getMonitor/JKvyVhBqBO' }

const HOUR = 3_600_000
const iso = (msAgo: number) => new Date(Date.now() - msAgo).toISOString().replace('.000Z', '+00:00')

const days = (ratios: number[]) =>
  ratios.map((ratio, i) => ({ date: `2026-09-${String(20 + i).padStart(2, '0')}`, ratio: ratio.toFixed(3) }))

const monitorList = {
  status: 'ok',
  psp: { timezone: '+00:00', totalMonitors: 3, perPage: 30 },
  data: [
    {
      monitorId: 789132921,
      name: 'Jenkins',
      type: 'HTTP(s)',
      statusClass: 'danger',
      dailyRatios: days([100, 100, 97.5]),
      '30dRatio': { ratio: '99.504' },
      '90dRatio': { ratio: '98.126' },
      lastDowntime: { date: '2026-09-30 12:39:47', duration: 650, reason: 'Incident detected' },
    },
    {
      monitorId: 789202203,
      name: 'GItlab',
      type: 'HTTP(s)',
      statusClass: 'success',
      dailyRatios: days([100, 100, 100]),
      '30dRatio': { ratio: '100.000' },
      '90dRatio': { ratio: '100.000' },
      lastDowntime: null,
    },
    {
      monitorId: 789132898,
      name: 'Minecraft &#40;25565&#41;',
      type: 'Port',
      statusClass: 'paused',
      dailyRatios: days([0, 0, 0]),
      '30dRatio': { ratio: '0.000' },
      '90dRatio': { ratio: '0.000' },
      lastDowntime: null,
    },
  ],
}

const jenkinsDetail = {
  status: 'ok',
  monitor: {
    logs: [
      { class: 'danger', dateGMTISO: iso(2 * HOUR), reason: { code: '503', detail: { short: 'Service Unavailable' } } },
      { class: 'success', dateGMTISO: iso(72 * HOUR), reason: { code: '200', detail: { short: 'OK' } } },
    ],
  },
}

const node = (id: string) => cy.get(`.react-flow__node[data-id="${id}"]`)

const visitArch = () =>
  cy.visit('/arch', {
    onBeforeLoad(win) {
      win.localStorage.setItem('locale', 'en-US')
    },
  })

describe('Architecture uptime', () => {
  beforeEach(() => {
    cy.viewport(1280, 900)
  })

  it('shows live status and 30-day uptime on monitored nodes', () => {
    cy.intercept(LIST, monitorList).as('list')
    visitArch()
    cy.wait('@list')

    node('jenkins').should('contain.text', 'unhealthy').and('contain.text', '99.50% uptime (30d)')
    node('gitlab').should('contain.text', 'healthy').and('contain.text', '100% uptime (30d)')
    node('minecraft-25565').should('contain.text', 'paused').find('[data-cy="node-uptime"]').should('not.exist')
    // Not monitored, or not on the status page: keeps its static status.
    node('cloudflare').should('contain.text', 'unknown')
    node('cas').should('contain.text', 'unknown')

    cy.get('[data-cy="uptime-caption"]').should('contain.text', 'Live status from UptimeRobot')
  })

  it('shows uptime details and recent events for a selected service', () => {
    cy.intercept(LIST, monitorList).as('list')
    cy.intercept(DETAIL, jenkinsDetail).as('detail')
    visitArch()
    cy.wait('@list')

    node('jenkins').click()
    cy.wait('@detail').its('request.url').should('include', 'm=789132921')

    cy.get('[data-cy="service-uptime"]').within(() => {
      cy.get('[data-cy="uptime-status"]').should('have.text', 'Down')
      cy.get('[data-cy="uptime-ratio"]').then(($ratios) => {
        expect([...$ratios].map((el) => el.textContent)).to.deep.equal(['99.50%', '98.12%'])
      })
      cy.contains('Last downtime').next().should('contain.text', 'lasted 10 min')
      cy.get('[data-cy="uptime-events"] li').should('have.length', 2)
      cy.get('[data-cy="uptime-events"] li').first()
        .should('contain.text', 'Down')
        .and('contain.text', '(ongoing)')
        .and('contain.text', '503 Service Unavailable')
      cy.contains('a', 'View on status page')
        .should('have.attr', 'href', 'https://stats.uptimerobot.com/JKvyVhBqBO/789132921')
    })
  })

  it('explains paused and unmonitored services', () => {
    cy.intercept(LIST, monitorList).as('list')
    visitArch()
    cy.wait('@list')

    node('minecraft-25565').click()
    cy.get('[data-cy="service-uptime"]').should('contain.text', 'Monitoring is paused')

    node('cloudflare').click()
    cy.get('[data-cy="service-uptime"]').should('contain.text', 'This service has no uptime monitor.')
  })

  it('keeps the static chart when UptimeRobot is unreachable', () => {
    cy.intercept(LIST, { statusCode: 500, body: {} }).as('list')
    visitArch()
    cy.wait('@list')

    cy.get('[data-cy="uptime-caption"]').should('contain.text', 'Live status is unavailable right now.')
    node('jenkins').should('contain.text', 'unknown').find('[data-cy="node-uptime"]').should('not.exist')
  })
})
