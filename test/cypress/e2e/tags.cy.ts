/**
 * Verifies the tag pages (homepage/src/app/tags/[slug]/page.tsx):
 *
 *  - Tags on a post (/posts/[slug]) are links to /tags/[tag], both in the meta
 *    bar under the title and in the "Note Info" sidebar.
 *  - /tags/[tag] lists every post carrying that tag, and only those.
 *  - Non-ASCII tags (e.g. 日本留學) round-trip through the URL.
 *  - Unknown tags 404.
 */

/** Tag chips in the meta bar under the post title. */
const META_TAGS = '[data-cy="post-tag"]'
/** Tag chips in the desktop "Note Info" sidebar. */
const SIDEBAR_TAGS = '[data-cy="sidebar-tag"]'
/** Rows of the post list on a tag page. */
const POST_ITEMS = '[data-cy="post-item"]'

const tagPath = (tag: string) => `/tags/${encodeURIComponent(tag)}`

/**
 * Visit a page and wait until it has hydrated. Post.tsx re-parses the markdown
 * on mount and remounts the sidebar, so a click that lands before that is lost.
 */
const visitReady = (path: string) => {
  cy.visit(path)
  cy.get('html[data-keyboard-nav="ready"]')
}

/** The tag page's pathname as the browser reports it (percent-encoded). */
const expectOnTagPage = (tag: string) => {
  cy.location('pathname').should('eq', tagPath(tag))
  cy.get('h1').should('have.text', `#${tag}`)
}

describe('Tag pages', () => {
  beforeEach(() => {
    cy.viewport(1280, 800)
  })

  it('links the tags under a post title to their tag page', () => {
    visitReady('/posts/cissp')
    cy.get(META_TAGS).contains('#CISSP').click()

    expectOnTagPage('CISSP')
    cy.get(POST_ITEMS).find('a[href="/posts/cissp"]').should('exist')
  })

  it('links the sidebar tags to their tag page', () => {
    visitReady('/posts/cissp')
    cy.get(SIDEBAR_TAGS).filter(':visible').contains('#CISSP').click()

    expectOnTagPage('CISSP')
  })

  it('gives every tag on a post a link to its own tag page', () => {
    visitReady('/posts/cissp')
    cy.get(META_TAGS)
      .should('have.length.greaterThan', 0)
      .each(($a) => {
        const tag = $a.text().replace(/^#/, '')
        expect($a.attr('href'), `href of #${tag}`).to.equal(tagPath(tag))
      })
  })

  it('lists every related post for a non-ASCII tag, and only those', () => {
    const tag = '日本留學'
    visitReady('/posts/japan-study-00-visa')
    cy.get(META_TAGS).contains(`#${tag}`).click()

    expectOnTagPage(tag)
    cy.get(POST_ITEMS).should('have.length.greaterThan', 1)
    cy.get(POST_ITEMS).find('a[href="/posts/japan-study-00-visa"]').should('exist')
    // A post without the tag must not show up.
    cy.get(POST_ITEMS).find('a[href="/posts/cissp"]').should('not.exist')

    // Every listed post really carries the tag.
    cy.get(`${POST_ITEMS} a`).then(($links) => {
      const hrefs = [...$links].map((a) => a.getAttribute('href')!)
      hrefs.forEach((href) => {
        visitReady(href)
        cy.get(META_TAGS).contains(`#${tag}`).should('exist')
      })
    })
  })

  it('opens a post from the tag page', () => {
    visitReady(tagPath('CISSP'))
    cy.get(`${POST_ITEMS} a[href="/posts/cissp"]`).click()
    cy.location('pathname').should('eq', '/posts/cissp')
  })

  it('returns 404 for an unknown tag', () => {
    cy.request({ url: tagPath('no-such-tag-xyz'), failOnStatusCode: false })
      .its('status')
      .should('eq', 404)
  })
})
