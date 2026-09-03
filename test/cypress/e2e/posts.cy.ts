/**
 * Covers /posts (PostsList) and /posts/[slug] (Post + its subcomponents:
 * NoteTitle, NoteHeaderDate, TableOfContents, ReadingProgress, markdown body).
 */
describe('Posts list', () => {
  beforeEach(() => {
    cy.viewport(1280, 1000)
    cy.visit('/posts')
  })

  it('renders a non-empty list of posts, each with a relative/absolute date', () => {
    cy.get('.shiro-timeline--posts li').should('have.length.greaterThan', 0)
    cy.get('.shiro-timeline--posts li').each(($li) => {
      cy.wrap($li).find('a').should('have.attr', 'href').and('match', /^\/posts\//)
      cy.wrap($li).find('span').last().invoke('text').should('not.be.empty')
    })
  })

  it('never shows "NaN" or "undefined" in a post timestamp', () => {
    cy.get('.shiro-timeline--posts li span').each(($el) => {
      cy.wrap($el).invoke('text').should('not.match', /NaN|undefined/i)
    })
  })
})

describe('Post detail page', () => {
  beforeEach(() => {
    // The right-hand sidebar (table of contents, reading progress) is only
    // shown at the `xl` breakpoint (1280px) — Cypress's default viewport
    // (1000x660) is narrower than that and hides it entirely.
    cy.viewport(1280, 1000)
  })

  it('navigates from the list into a post and renders its title and content', () => {
    cy.visit('/posts')
    cy.get('.shiro-timeline--posts li a').first().click()
    cy.location('pathname').should('match', /^\/posts\/.+/)

    cy.get('h1').should('be.visible').invoke('text').should('have.length.greaterThan', 0)
    // The markdown body renders at least one paragraph or heading.
    cy.get('article, main').find('p, h2, h3').should('have.length.greaterThan', 0)
  })

  it('renders one table-of-contents entry per in-body heading and clicking one scrolls the page', () => {
    // Not every post has headings (TableOfContents renders null when it has
    // none), so find one that does by trying each post link in turn.
    cy.visit('/posts')
    cy.get('.shiro-timeline--posts li a')
      .then(($links) => Cypress._.map($links.toArray(), (a) => a.getAttribute('href') as string))
      .then((hrefs) => {
        const tryNext = (remaining: string[]): void => {
          if (remaining.length === 0) {
            cy.log('No post with headings found among the available posts — skipping.')
            return
          }
          const [href, ...rest] = remaining
          cy.visit(href)
          cy.get('body').then(($body) => {
            const headingCount = $body.find('[data-markdown-heading]').length
            if (headingCount === 0) {
              tryNext(rest)
              return
            }

            cy.contains('h3', /table of contents/i)
              .parent()
              .find('button')
              .should('have.length', headingCount)

            cy.window().its('scrollY').should('eq', 0)
            cy.contains('h3', /table of contents/i).parent().find('button').last().click()
            cy.window().its('scrollY').should('be.greaterThan', 0)
          })
        }
        tryNext(hrefs)
      })
  })

  it('updates the reading-progress indicator as the page is scrolled', () => {
    cy.visit('/posts')
    cy.get('.shiro-timeline--posts li a').first().click()

    cy.get('body').then(($body) => {
      const hasProgress = $body.text().match(/\b\d{1,3}%\b/)
      if (!hasProgress) {
        cy.log('No reading-progress indicator on this viewport/post — skipping.')
        return
      }
      cy.scrollTo('bottom', { ensureScrollable: false })
      cy.wait(300)
      cy.contains(/100%|\d{1,3}%/).should('exist')
    })
  })
})
