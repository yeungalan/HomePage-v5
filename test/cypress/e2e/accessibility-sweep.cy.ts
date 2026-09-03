/**
 * A baseline accessibility/markup-hygiene sweep across every top-level page
 * (buttons.cy.ts already does the same disabled-button/empty-href checks,
 * but only for the home page — this generalizes it to the whole site).
 */
const ROUTES = ['/', '/goals', '/posts', '/projects', '/friends', '/arch', '/world']

// /world is a bare full-viewport globe map with no page heading by design.
const ROUTES_WITH_H1 = ROUTES.filter((r) => r !== '/world')

describe('Accessibility & markup hygiene sweep', () => {
  ROUTES.forEach((route) => {
    describe(`${route}`, () => {
      beforeEach(() => {
        cy.viewport(1280, 900)
        cy.visit(route)
      })

      it('has a non-empty <title> and an <html lang>', () => {
        cy.title().should('not.be.empty')
        cy.get('html').should('have.attr', 'lang').and('not.be.empty')
      })

      if (ROUTES_WITH_H1.includes(route)) {
        it('has at least one <h1>', () => {
          cy.get('h1').should('have.length.greaterThan', 0)
        })
      }

      it('gives every image a non-null alt attribute (if the page has any)', () => {
        // Several pages (goals, posts list, arch) render everything as
        // iconify SVGs and have zero <img> elements — that's fine, only
        // check alt text on pages that actually use <img>.
        cy.get('body').then(($body) => {
          if ($body.find('img').length === 0) return
          cy.get('img').each(($img) => {
            cy.wrap($img).should('have.attr', 'alt')
          })
        })
      })

      it('leaves no visible button disabled', () => {
        cy.get('button:visible').each(($btn) => {
          cy.wrap($btn).should('not.be.disabled')
        })
      })

      it('gives every visible link a non-empty href', () => {
        cy.get('a:visible').each(($a) => {
          const href = $a.attr('href')
          expect(href, 'link has a non-empty href').to.be.a('string').and.not.equal('')
        })
      })
    })
  })
})
