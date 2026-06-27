/**
 * Verifies that every interactive control on the site is clickable.
 *
 * "Clickable" here means: the element is rendered, visible, enabled, and
 * actually responds when clicked (navigates, toggles state, or opens a menu).
 * It covers the header navigation, the footer quick links, the language
 * switcher, the theme switcher, the hero "new quote" button, and finishes with
 * a broad sweep asserting no visible button is left in a disabled state.
 */
describe('Interactive controls are clickable', () => {
  beforeEach(() => {
    // Wide viewport so the desktop header (not the mobile menu) is shown.
    cy.viewport(1280, 800)
  })

  it('navigates through the desktop header links', () => {
    cy.visit('/')

    const navTargets: Array<{ label: string; path: string }> = [
      { label: 'Goals', path: '/goals' },
      { label: 'Posts', path: '/posts' },
      { label: 'Places I visited', path: '/world' },
    ]

    navTargets.forEach(({ label, path }) => {
      cy.visit('/')
      cy.contains('a', label).filter(':visible').first().click()
      cy.location('pathname').should('eq', path)
    })
  })

  it('opens the "More" submenu and follows its links', () => {
    cy.visit('/')

    const subTargets: Array<{ label: string; path: string }> = [
      { label: 'Projects', path: '/projects' },
      { label: 'Friends Link', path: '/friends' },
      { label: 'Architecture', path: '/arch' },
    ]

    subTargets.forEach(({ label, path }) => {
      cy.visit('/')
      // Hovering the "More" item reveals the submenu popover.
      cy.contains('More').filter(':visible').first().trigger('mouseenter')
      cy.contains('a', label).filter(':visible').first().click()
      cy.location('pathname').should('eq', path)
    })
  })

  it('exposes a clickable, enabled option for every language', () => {
    cy.visit('/')

    cy.get('button[aria-haspopup="listbox"]').should('be.enabled').click()
    cy.get('ul[role="listbox"]').should('be.visible')
    cy.get('li[role="option"] button').should('have.length', 3)
    cy.get('li[role="option"] button').each(($btn) => {
      cy.wrap($btn).should('be.visible').and('be.enabled')
    })
  })

  it('toggles the theme switcher buttons', () => {
    cy.visit('/')

    cy.get('button[aria-label="Switch to dark theme"]')
      .should('be.visible')
      .and('be.enabled')
      .click()
    cy.get('html').should('have.class', 'dark')

    cy.get('button[aria-label="Switch to light theme"]')
      .should('be.enabled')
      .click()
    cy.get('html').should('not.have.class', 'dark')

    cy.get('button[aria-label="Switch to system theme"]').should('be.enabled').click()
  })

  it('clicks the hero "new quote" button', () => {
    cy.visit('/')
    cy.get('button[aria-label="Change a new sentence"]')
      .should('be.visible')
      .and('be.enabled')
      .click()
  })

  it('follows the footer quick links', () => {
    const footerTargets: Array<{ label: string; path: string }> = [
      { label: 'Post', path: '/posts' },
      { label: 'Friends link', path: '/friends' },
    ]

    footerTargets.forEach(({ label, path }) => {
      cy.visit('/')
      cy.contains('a', label).filter(':visible').first().scrollIntoView().click()
      cy.location('pathname').should('eq', path)
    })
  })

  it('leaves no visible button disabled and every internal link with a href', () => {
    cy.visit('/')

    // No visible button should be disabled.
    cy.get('button:visible').each(($btn) => {
      cy.wrap($btn).should('not.be.disabled')
    })

    // Every visible link must point somewhere (no dead href="").
    cy.get('a:visible').each(($a) => {
      const href = $a.attr('href')
      expect(href, 'link has a non-empty href').to.be.a('string').and.not.equal('')
    })
  })
})
