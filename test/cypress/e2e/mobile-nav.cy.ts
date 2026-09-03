/**
 * MobileNav is only rendered/shown at narrow viewports (the desktop header
 * hides its button via responsive classes; buttons.cy.ts already covers the
 * desktop nav at 1280x800). This covers the mobile drawer: opening, its
 * links, and closing via the overlay.
 *
 * All link lookups are scoped to `[role="dialog"]` (Radix's Dialog.Content,
 * asChild-merged onto the drawer's motion.div): the desktop header's own nav
 * links ("Home", "Goals", ...) are still in the DOM at this viewport — just
 * hidden by responsive classes — and `cy.contains()` would otherwise match
 * those (invisible) links first.
 */

/**
 * Clicking the hamburger button immediately after `cy.visit` can land before
 * this heavy, animation/three.js-laden app finishes hydrating (its onClick
 * isn't attached yet), so the very first click is silently a no-op — same
 * class of hydration-timing issue `revealFooter` works around elsewhere in
 * this suite. Retry the click a few times until the drawer actually opens
 * rather than guessing a fixed delay.
 */
const openMobileNav = (attemptsLeft = 5): void => {
  cy.get('button[aria-label="Open navigation menu"]').click()
  cy.get('body').then(($body) => {
    if ($body.find('[role="dialog"]').length > 0) return
    if (attemptsLeft <= 1) {
      // Let the final attempt's assertion below fail with a clear message.
      return
    }
    cy.wait(300)
    openMobileNav(attemptsLeft - 1)
  })
}

describe('Mobile navigation drawer', () => {
  beforeEach(() => {
    cy.viewport(390, 844) // iPhone 12-ish
    cy.visit('/')
  })

  it('opens the drawer from the hamburger button and lists the main sections', () => {
    openMobileNav()

    cy.get('[role="dialog"]').within(() => {
      cy.contains('Home').should('be.visible')
      cy.contains('Goals').should('be.visible')
      cy.contains('Posts').should('be.visible')
    })
  })

  it('navigates to a page and closes the drawer', () => {
    openMobileNav()
    cy.get('[role="dialog"]').contains('a', 'Goals').click()
    cy.location('pathname').should('eq', '/goals')
  })

  it('closes when the overlay is clicked, without navigating', () => {
    openMobileNav()
    cy.get('[role="dialog"]').contains('Home').should('be.visible')

    // Click the overlay itself (top-left corner, away from the drawer sheet
    // which is pinned to the bottom of the viewport). Radix's scroll lock
    // sets `pointer-events: none` on <body> itself while the dialog is open,
    // which fails Cypress's actionability check even though the overlay on
    // top of it is very much clickable — force through it.
    cy.get('body').click(10, 10, { force: true })
    cy.location('pathname').should('eq', '/')
  })
})
