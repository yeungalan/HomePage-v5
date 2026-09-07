/**
 * Verifies that posts typeset LaTeX with KaTeX.
 *
 * The demo post at /posts/test carries a "Math (LaTeX)" section exercising
 * every supported form: `$…$` inline math, `$$…$$` display blocks, ```math
 * fenced blocks, formulas inside lists/tables/headings, and dollar signs that
 * must stay literal. This spec asserts each of those actually renders as math
 * rather than leaking raw TeX onto the page.
 */
const MATH_POST = '/posts/test'

describe('LaTeX math in posts', () => {
  beforeEach(() => {
    // Wide enough for the desktop layout, including the right-hand TOC (xl).
    cy.viewport(1600, 900)
    cy.visit(MATH_POST)
    // The markdown body is rendered client-side; wait for the math section.
    cy.get('#math-latex').should('exist')
  })

  it('typesets every formula in the post', () => {
    // remark-math leaves `math-inline` / `math-display` placeholders behind and
    // ```math fences stay `code.language-math` when KaTeX has not run.
    cy.get('.math-inline, .math-display').should('not.exist')
    cy.get('code.language-math').should('not.exist')

    // KaTeX renders unparsable input as a red `.katex-error` span instead of
    // throwing, so an empty result here means every example is valid TeX.
    cy.get('.katex-error').should('not.exist')

    cy.get('.katex').should('have.length.at.least', 15)
  })

  it('loads the KaTeX stylesheet', () => {
    // Without katex.min.css the math is unstyled and the hidden MathML copy
    // shows up as duplicated text, so check the stylesheet actually applied.
    cy.get('.katex').first().should('have.css', 'font-family').and('match', /KaTeX/)
  })

  it('renders $…$ inline, in the flow of its paragraph', () => {
    cy.contains('h3', 'Inline math')
      .next('p')
      .within(() => {
        cy.get('.katex').should('have.length.at.least', 5)
        // Inline math must not be promoted to a centred display block.
        cy.get('.katex-display').should('not.exist')
      })
  })

  it('renders $$…$$ as centred display blocks', () => {
    cy.contains('h3', 'Display math')
      .next('p')
      .next('.katex-display')
      .should('be.visible')
      .and('have.css', 'display', 'block')

    cy.get('.katex-display').should('have.length.at.least', 5)
  })

  it('renders ```math fenced blocks as display math', () => {
    // The fenced blocks hold `aligned`, `cases` and `bmatrix` environments;
    // each becomes a display-mode formula rather than a highlighted code block.
    cy.contains('h3', 'Fenced math blocks')
      .next('p')
      .next('.katex-display')
      .should('be.visible')
      .find('.mtable')
      .should('exist')
  })

  it('renders math inside list items and table cells', () => {
    cy.contains('h3', 'Math inside other blocks')
      .next('p')
      .next('ol')
      .find('li .katex')
      .should('have.length.at.least', 4)

    cy.get('table').last().find('td .katex').should('have.length.at.least', 4)
  })

  it('renders math in a heading and lists it once in the table of contents', () => {
    cy.contains('h3', 'Headings can hold math').find('.katex').should('exist')

    // The TOC label is built from the heading's visible text. KaTeX also emits
    // a hidden MathML copy (which carries the raw TeX in an <annotation>), so a
    // naive textContent read would repeat the formula and leak `^` into the
    // label.
    cy.contains('button', 'Headings can hold math')
      .should('have.attr', 'title')
      .then((title) => {
        const label = String(title)
        expect(label, 'no raw TeX in the TOC label').to.not.contain('^')
        expect(
          label.split('a2+b2=c2').length - 1,
          'formula appears exactly once in the TOC label',
        ).to.eq(1)
      })
  })

  it('leaves escaped dollars and inline code as plain text', () => {
    cy.contains('h3', 'Escaping dollar signs')
      .next('p')
      .within(() => {
        cy.get('.katex').should('not.exist')
        cy.get('code').should('contain.text', '$not math$')
      })

    cy.contains('p', '$5 and $10').should('be.visible')
  })
})
