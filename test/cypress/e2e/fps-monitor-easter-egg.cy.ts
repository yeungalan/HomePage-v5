/**
 * Hidden feature in FooterLinks.tsx: tapping the "Rev. ..." revision text
 * five times toggles a `fps-monitor-enabled` flag (persisted to localStorage
 * and broadcast via a `fps-monitor-toggle` CustomEvent), which StatComponent
 * listens for and mounts a stats.js FPS panel in response.
 */
describe('FPS monitor easter egg (5 taps on the footer revision text)', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.revealFooter()
  })

  it('enables the FPS panel after 5 taps and persists the flag', () => {
    // Cypress auto-stubs window.alert, so the feature's alert() call never
    // actually blocks the run.
    cy.window().then((win) => cy.stub(win, 'alert').as('alert'))

    cy.contains(/^Rev\. /).click().click().click().click().click()

    cy.get('@alert').should('have.been.calledOnce')
    cy.window().its('localStorage').invoke('getItem', 'fps-monitor-enabled').should('eq', 'true')
    // stats.js appends a fixed-position, top-right panel element to <body>
    // (StatComponent sets right/top/zIndex inline after creating it).
    cy.get('body > div[style*="position: fixed"][style*="right: 0"]', { timeout: 10000 }).should(
      'exist',
    )
  })

  it('disables it again after another 5 taps', () => {
    cy.contains(/^Rev\. /).click().click().click().click().click()
    cy.window().its('localStorage').invoke('getItem', 'fps-monitor-enabled').should('eq', 'true')

    cy.contains(/^Rev\. /).click().click().click().click().click()
    cy.window().its('localStorage').invoke('getItem', 'fps-monitor-enabled').should('eq', 'false')
  })
})
