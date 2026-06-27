/**
 * Verifies that the site displays correctly in every supported UI language.
 *
 * Two things are checked:
 *   1. When a locale is preselected (persisted in localStorage, exactly how the
 *      real app remembers a returning visitor's choice), every page renders in
 *      that language with no Next.js error overlay.
 *   2. The footer language switcher actually changes the language live and
 *      persists the new choice.
 */
import { LOCALES, ROUTES } from '../support/locales'

/** Assert the page mounted without a Next.js dev/runtime error overlay. */
const assertNoErrorOverlay = () => {
  cy.get('nextjs-portal', { timeout: 1000 }).should('not.exist')
  cy.contains(/Application error|Unhandled Runtime Error|This page could not be found/i).should(
    'not.exist',
  )
}

/** Force the app to boot in a given locale before any script runs. */
const visitWithLocale = (path: string, code: string) => {
  cy.visit(path, {
    onBeforeLoad(win) {
      win.localStorage.setItem('locale', code)
    },
  })
}

describe('Multi-language display', () => {
  LOCALES.forEach((locale) => {
    describe(`Locale: ${locale.fullLabel} (${locale.code})`, () => {
      it('renders the home page with the correct translations', () => {
        visitWithLocale('/', locale.code)

        // The <html lang> attribute is kept in sync with the active locale.
        cy.get('html').should('have.attr', 'lang', locale.code)

        // Navigation labels are translated.
        cy.contains(locale.home.navHome).should('be.visible')
        cy.contains(locale.home.navGoals).should('be.visible')
        cy.contains(locale.home.navPosts).should('be.visible')

        // Footer "quick links" heading is translated.
        cy.contains(locale.home.quickLinksTitle).should('be.visible')

        // The language switcher trigger shows this locale's short label.
        cy.get('button[aria-haspopup="listbox"]').should('contain.text', locale.shortLabel)

        assertNoErrorOverlay()
      })

      ROUTES.forEach((route) => {
        it(`renders ${route} without errors`, () => {
          visitWithLocale(route, locale.code)
          cy.get('body').should('be.visible')
          cy.get('html').should('have.attr', 'lang', locale.code)
          assertNoErrorOverlay()
        })
      })
    })
  })

  it('switches language live through the footer switcher and persists it', () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('locale', 'en-US')
      },
    })

    cy.contains('Quick links').should('be.visible')
    cy.revealFooter()

    // Open the switcher and pick Japanese.
    cy.get('button[aria-haspopup="listbox"]').click()
    cy.get('ul[role="listbox"]').should('be.visible')
    cy.get('li[role="option"]').contains('日本語').click()

    // UI updates live...
    cy.get('button[aria-haspopup="listbox"]').should('contain.text', 'JA')
    cy.contains('クイックリンク').should('be.visible')
    cy.get('html').should('have.attr', 'lang', 'ja-JP')

    // ...and the choice is persisted for the next visit.
    cy.window().its('localStorage.locale').should('eq', 'ja-JP')
  })
})
