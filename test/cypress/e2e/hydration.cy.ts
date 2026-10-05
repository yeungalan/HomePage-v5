/**
 * Every page must hydrate cleanly: the pre-rendered HTML has to match the
 * browser's first render. On a mismatch React throws "Minified React error
 * #418" (or #421-#425) and discards the server HTML.
 *
 * Typical causes are rendering something that differs between the build and the
 * visit: Math.random(), the current time, the visitor's timezone or locale, or
 * localStorage. Pick those after mount instead (see useMountedRandom).
 *
 * CI builds the site in UTC and runs this browser in Asia/Tokyo, like Vercel
 * and a visitor in Japan, and each visit moves the browser clock 40 days past
 * the build, so timezone- and time-dependent rendering is caught as well.
 */

const ROUTES = [
  '/',
  '/arch',
  '/friends',
  '/goals',
  '/posts',
  '/posts/test',
  '/posts/aboutme',
  '/posts/aboutme_en',
  '/projects',
  '/tags/homelab',
  '/world',
]

const HYDRATION_ERROR = /hydrat|did(n't| not) match|Minified React error #(418|421|422|423|425)/i

describe('Hydration', () => {
  ROUTES.forEach((route) => {
    it(`${route} hydrates without errors when visited 40 days after the build`, () => {
      const problems: string[] = []
      cy.clock(Date.now() + 40 * 86_400_000, ['Date'])
      cy.visit(route, {
        onBeforeLoad(win) {
          const consoleError = win.console.error.bind(win.console)
          win.console.error = (...args: unknown[]) => {
            const text = args.map(String).join(' ')
            if (HYDRATION_ERROR.test(text)) problems.push(text.slice(0, 500))
            consoleError(...args)
          }
        },
      })
      // KeyboardNav sets this from an effect, so hydration has finished.
      cy.get('html[data-keyboard-nav="ready"]')
      cy.then(() => {
        expect(problems, 'hydration errors').to.deep.equal([])
      })
    })
  })
})
