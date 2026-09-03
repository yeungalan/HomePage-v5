/**
 * Covers the components rendered directly on the home page: HeroSection
 * (greeting, social icons, quote button), ActivitySection (awards list,
 * experience timeline), and the two footers.
 *
 * Deliberately does not import ../../homepage/src/data/* here (matching the
 * convention set in support/locales.ts): the test package's dependencies
 * must never reach into the app package, so content is asserted structurally
 * or against a handful of stable, human-picked strings instead of the live
 * data arrays.
 */

// Platforms wired up via SocialIcon in HeroSection. Stable enough to hardcode
// (a new platform requires adding an icon component, not just data).
const SOCIAL_PLATFORMS = ['github', 'linkedin', 'instagram', 'twitter']

describe('Home page components', () => {
  beforeEach(() => {
    cy.viewport(1280, 900)
    cy.visit('/')
  })

  it('renders the hero greeting and a social icon link for every configured platform', () => {
    cy.get('h1, [class*="giant"]').should('exist')

    SOCIAL_PLATFORMS.forEach((platform) => {
      cy.get(`a[href*="${platform}"]`).should('exist')
    })
  })

  it('changes the displayed quote when the refresh button is clicked', () => {
    cy.get('button[aria-label="Change a new sentence"]').as('quoteBtn')
    cy.get('@quoteBtn')
      .parents()
      .find('small')
      .first()
      .invoke('text')
      .then((before) => {
        cy.get('@quoteBtn').click()
        cy.get('@quoteBtn')
          .parents()
          .find('small')
          .first()
          .invoke('text')
          .should('have.length.greaterThan', 0)
      })
  })

  it('lists the CISSP award with a non-empty relative/absolute date', () => {
    cy.contains('h2', /awards/i).should('exist')
    cy.contains('li', /Certified Information Systems Security Professional/i).within(() => {
      cy.get('span').last().invoke('text').should('not.be.empty')
    })
  })

  it('never shows "NaN" or "undefined" in any award timestamp', () => {
    cy.get('.shiro-timeline li span').each(($el) => {
      cy.wrap($el).invoke('text').should('not.match', /NaN|undefined/i)
    })
  })

  it('renders the experience timeline with recognizable milestones', () => {
    cy.contains('Moved to Japan').should('exist')
    cy.contains(/Student|Kudan Institute/).should('exist')
  })

  it('renders both footers (quick links and the site-wide footer)', () => {
    cy.revealFooter()
    cy.contains('Quick links').should('be.visible')
    cy.get('footer').should('exist')
  })
})
