/**
 * Cypress support file, loaded before every e2e spec.
 *
 * Benign rendering noise from motion/three.js (ResizeObserver / WebGL) is not a
 * test failure, so it is swallowed here. Anything else fails the run as usual.
 * That includes React hydration errors ("Minified React error #418" and
 * friends), which mean the pre-rendered HTML disagreed with the browser's first
 * render; hydration.cy.ts checks every page for them.
 */
const isBenign = (message: string): boolean => {
  const benign = [
    'ResizeObserver loop',
    'WebGL', // react-globe.gl / three.js in headless Chrome
  ]
  return benign.some((needle) => message.includes(needle))
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
