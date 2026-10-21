/**
 * The /arch flow chart takes each service's live status and uptime from the
 * public UptimeRobot status page (homepage/src/lib/uptime.ts), and third-party
 * providers' status from their official status pages via /api/status
 * (homepage/src/lib/official-status.ts). Both are stubbed here so the
 * assertions don't depend on the real monitors.
 */

const LIST = { hostname: 'stats.uptimerobot.com', pathname: '/api/getMonitorList/JKvyVhBqBO' }
const DETAIL = { hostname: 'stats.uptimerobot.com', pathname: '/api/getMonitor/JKvyVhBqBO' }

const OFFICIAL = { pathname: '/api/status' }

const officialStatuses = {
  cloudflare: { status: 'warning', summary: 'CDN/Cache: degraded performance' },
  icloud: { status: 'healthy' },
  'aws-s3': { status: 'healthy' },
  'aws-glacier': { status: 'unhealthy', summary: 'Increased Error Rates' },
}

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
    cy.intercept(OFFICIAL, officialStatuses).as('official')
  })

  it('shows live status and 30-day uptime on monitored nodes', () => {
    cy.intercept(LIST, monitorList).as('list')
    visitArch()
    cy.wait('@list')

    node('jenkins').should('contain.text', 'unhealthy').and('contain.text', '99.50% uptime (30d)')
    node('gitlab').should('contain.text', 'healthy').and('contain.text', '100% uptime (30d)')
    node('minecraft-25565').should('contain.text', 'paused').find('[data-cy="node-uptime"]').should('not.exist')
    // Not on the status page: keeps its static status.
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

    node('user').click()
    cy.get('[data-cy="service-uptime"]').should('contain.text', 'This service has no uptime monitor.')
  })

  it('shows third-party status from the official status pages', () => {
    cy.intercept(LIST, monitorList).as('list')
    visitArch()
    cy.wait(['@list', '@official'])

    node('cloudflare').should('contain.text', 'warning')
    node('icloud').should('contain.text', 'healthy')
    node('amazon-glacier').should('contain.text', 'healthy')
    node('core-data-storage').should('contain.text', 'unhealthy')

    node('core-data-storage').click()
    cy.get('[data-cy="service-uptime"]').within(() => {
      cy.get('[data-cy="uptime-status"]').should('have.text', 'Down')
      cy.root().should('contain.text', 'AWS Health Dashboard (Glacier, us-east-1)')
      cy.root().should('contain.text', 'Increased Error Rates')
    })
  })

  it('combines the status of the services behind the load balancer and service exit', () => {
    cy.intercept(LIST, monitorList).as('list')
    visitArch()
    cy.wait('@list')

    // Jenkins is down and Gitlab up, so the load balancer is degraded.
    node('lb').should('contain.text', 'warning')
    // Only paused or unknown Minecraft servers behind it: counts as healthy.
    node('serviceExit').should('contain.text', 'healthy')
  })

  it('summarizes overall status and 30-day uptime against the SLA', () => {
    cy.intercept(LIST, monitorList).as('list')
    visitArch()
    cy.wait(['@list', '@official'])

    cy.get('[data-cy="status-summary-headline"]').should('have.text', 'Partially operational')
    // Mean of Jenkins (99.504) and Gitlab (100); the paused Minecraft server is left out.
    cy.get('[data-cy="status-summary-uptime"]').should('contain.text', '30-day uptime: 99.75%')
    cy.get('[data-cy="status-summary-sla"]').should('have.text', 'Below 99.9% SLA')
  })

  it('keeps the static chart when UptimeRobot is unreachable', () => {
    cy.intercept(LIST, { statusCode: 500, body: {} }).as('list')
    visitArch()
    cy.wait('@list')

    cy.get('[data-cy="uptime-caption"]').should('contain.text', 'Live status is unavailable right now.')
    node('jenkins').should('contain.text', 'unknown').find('[data-cy="node-uptime"]').should('not.exist')
  })
})
