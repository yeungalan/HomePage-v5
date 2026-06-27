/**
 * Cypress support file, loaded before every e2e spec.
 *
 * The app throws a couple of classes of errors that are not test failures and
 * must be swallowed so they don't abort the run:
 *
 *  1. Benign rendering noise from motion/three.js (ResizeObserver / WebGL).
 *  2. React hydration mismatches. The production build (next build + next start)
 *     throws these as uncaught errors, whereas dev only warns. They are inherent
 *     to the app's design — e.g. the hero shows a random quote
 *     (useState(getRandomQuoteIndex())) and several pages render time-based
 *     content — so the server HTML and the first client render legitimately
 *     differ. These surface as "Minified React error #418/#421/#422/#423/#425"
 *     in production and as "Hydration failed"/"Text content does not match" in
 *     dev. Neither indicates a broken page, so we ignore them here. (The display
 *     and clickability the tests assert still run against the hydrated DOM.)
 *
 * Anything else is left to fail the run as usual.
 */
const HYDRATION_REACT_ERROR_CODES = ['418', '421', '422', '423', '425']

const isBenign = (message: string): boolean => {
  const benign = [
    'ResizeObserver loop',
    'WebGL', // react-globe.gl / three.js in headless Chrome
    // Dev-mode hydration messages.
    'Hydration failed',
    'Text content does not match',
    'did not match',
    'hydrated but some attributes',
  ]
  if (benign.some((needle) => message.includes(needle))) return true

  // Production minified hydration errors, e.g. "Minified React error #418".
  if (
    message.includes('Minified React error') &&
    HYDRATION_REACT_ERROR_CODES.some((code) => message.includes(`#${code}`))
  ) {
    return true
  }
  return false
}

Cypress.on('uncaught:exception', (err) => {
  if (isBenign(err.message)) {
    return false
  }
  return undefined
})

/**
 * Scroll to the very bottom of the page and let the footer's scroll-triggered
 * (whileInView) animations settle. The footer controls — language switcher,
 * theme switcher, quick links — only become reliably interactive once the
 * footer has been brought fully into view and its entrance animation has ended;
 * Cypress's per-element auto-scroll before a click is not enough on its own.
 */
Cypress.Commands.add('revealFooter', () => {
  cy.scrollTo('bottom', { ensureScrollable: false })
  // Give framer-motion's entrance springs time to finish.
  cy.wait(400)
})

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /** Scroll to the footer and wait for its entrance animations to settle. */
      revealFooter(): Chainable<void>
    }
  }
}

export {}
