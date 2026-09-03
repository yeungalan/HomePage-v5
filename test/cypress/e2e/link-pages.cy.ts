/**
 * /projects and /friends both render LinkCardGrid -> LinkCard, backed by
 * PROJECTS_DATA / FRIENDS_DATA respectively. Covers the grid, the card's
 * avatar/link/accessibility attributes, and hover state.
 */
const pages = [
  { path: '/projects', minCards: 1 },
  { path: '/friends', minCards: 1 },
]

pages.forEach(({ path, minCards }) => {
  describe(`LinkCardGrid on ${path}`, () => {
    beforeEach(() => {
      cy.viewport(1280, 900)
      cy.visit(path)
    })

    it(`renders at least ${minCards} card(s), each a real external link with an avatar`, () => {
      cy.get('a[role="link"]').should('have.length.greaterThan', minCards - 1)
      cy.get('a[role="link"]').each(($card) => {
        cy.wrap($card)
          .should('have.attr', 'href')
          .and('match', /^https?:\/\//)
        cy.wrap($card).should('have.attr', 'target', '_blank')
        cy.wrap($card).should('have.attr', 'rel').and('match', /noreferrer/)
        cy.wrap($card).should('have.attr', 'aria-label').and('match', /^Go to .+'s website$/)
        cy.wrap($card).find('img').should('exist')
      })
    })

    it('shows a hover background behind a card on hover', () => {
      // LinkCard tracks hover via onMouseEnter, which React derives from the
      // bubbling native "mouseover" event (see buttons.cy.ts for the same
      // caveat) — native "mouseenter" does not bubble and won't trigger it.
      cy.get('a[role="link"]').first().trigger('mouseover')
      cy.get('a[role="link"]').first().find('span[class*="absolute"]').should('exist')
    })
  })
})
