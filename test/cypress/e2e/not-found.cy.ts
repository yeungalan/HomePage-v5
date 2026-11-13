/**
 * Verifies the 404 page (homepage/src/app/not-found.tsx):
 *
 *  - Unknown URLs, posts and tags answer with HTTP 404.
 *  - The page shows the confused-face logo, a translated title and the address
 *    that was asked for, in every interface language.
 *  - "Back to home", "Go back" and the section links work.
 *  - It hydrates cleanly. One pre-rendered page answers every unknown URL, so
 *    the address may only be filled in after mount.
 */

const MISSING = '/no/such/page'

/** Expected strings, duplicated from the app's catalogues on purpose (see support/locales.ts). */
const LOCALES = [
  { code: 'en-US', title: 'Page not found', home: 'Back to home', back: 'Go back' },
  { code: 'zh-HK', title: '找不到頁面', home: '返回首頁', back: '返回上一頁' },
  { code: 'ja-JP', title: 'ページが見つかりません', home: 'ホームに戻る', back: '前のページに戻る' },
]

const HYDRATION_ERROR = /hydrat|did(n't| not) match|Minified React error #(418|421|422|423|425)/i

const SUGGESTION_LINKS = 'nav[aria-labelledby="not-found-suggestions"] a'

/** Visit a page that answers 404, in a given locale, and wait until it has hydrated. */
const visitMissing = (
  path: string,
  locale = 'en-US',
  onBeforeLoad?: (win: Cypress.AUTWindow) => void,
) => {
  cy.visit(path, {
    failOnStatusCode: false,
    onBeforeLoad(win) {
      win.localStorage.setItem('locale', locale)
      onBeforeLoad?.(win)
    },
  })
  cy.get('html[data-keyboard-nav="ready"]')
}

describe('404 page', () => {
  beforeEach(() => {
    cy.viewport(1280, 800)
  })

  it('answers unknown URLs, posts and tags with 404', () => {
    ;[MISSING, '/posts/no-such-post-xyz', '/tags/no-such-tag-xyz'].forEach((url) => {
      cy.request({ url, failOnStatusCode: false }).its('status').should('eq', 404)
    })
  })

  LOCALES.forEach(({ code, title, home, back }) => {
    it(`shows the logo, title and requested address in ${code}`, () => {
      visitMissing(MISSING, code)
      cy.get('html').should('have.attr', 'lang', code)
      cy.get('[data-cy="not-found-logo"] svg.nf-logo').should('be.visible')
      cy.get('h1').should('have.text', title)
      cy.get('[data-cy="not-found-home"]').should('have.text', home)
      cy.get('[data-cy="not-found-back"]').should('have.text', back)
      cy.get('[data-cy="not-found-path"]').should('contain.text', MISSING)
    })
  })

  it('is also shown for an unknown post', () => {
    visitMissing('/posts/no-such-post-xyz')
    cy.get('h1').should('have.text', 'Page not found')
    cy.get('[data-cy="not-found-path"]').should('contain.text', '/posts/no-such-post-xyz')
  })

  it('shows a non-ASCII address decoded', () => {
    visitMissing(`/tags/${encodeURIComponent('存在しないタグ')}`)
    cy.get('[data-cy="not-found-path"]').should('contain.text', '/tags/存在しないタグ')
  })

  it('goes home from "Back to home"', () => {
    visitMissing(MISSING)
    cy.get('[data-cy="not-found-home"]').click()
    cy.location('pathname').should('eq', '/')
  })

  it('returns to the previous page from "Go back"', () => {
    cy.visit('/projects')
    cy.get('html[data-keyboard-nav="ready"]')
    // Follow a plain link to the missing page, so it gets its own history entry.
    // It is pinned mid-screen above everything, clear of the fixed header.
    cy.document().then((doc) => {
      const link = doc.createElement('a')
      link.href = MISSING
      link.id = 'to-missing'
      link.textContent = 'missing page'
      link.style.cssText = 'position:fixed;top:50%;left:50%;z-index:2147483647;padding:8px;background:#fff'
      doc.body.append(link)
    })
    cy.get('#to-missing').click()
    cy.location('pathname').should('eq', MISSING)
    cy.get('html[data-keyboard-nav="ready"]')

    cy.get('[data-cy="not-found-back"]').click()
    cy.location('pathname').should('eq', '/projects')
  })

  it('links to the main sections', () => {
    visitMissing(MISSING)
    cy.get(SUGGESTION_LINKS).then(($links) => {
      const hrefs = [...$links].map((a) => a.getAttribute('href'))
      expect(hrefs).to.deep.equal(['/posts', '/world', '/goals', '/projects', '/friends', '/arch'])
    })
    cy.get(`${SUGGESTION_LINKS}[href="/posts"]`).click()
    cy.location('pathname').should('eq', '/posts')
  })

  it('hydrates without errors', () => {
    const problems: string[] = []
    visitMissing(MISSING, 'en-US', (win) => {
      const consoleError = win.console.error.bind(win.console)
      win.console.error = (...args: unknown[]) => {
        const text = args.map(String).join(' ')
        if (HYDRATION_ERROR.test(text)) problems.push(text.slice(0, 500))
        consoleError(...args)
      }
    })
    cy.get('[data-cy="not-found-path"]').should('contain.text', MISSING)
    cy.then(() => {
      expect(problems, 'hydration errors').to.deep.equal([])
    })
  })
})

// A module, so its top-level names don't clash with other specs' (e.g. HYDRATION_ERROR).
export {}
