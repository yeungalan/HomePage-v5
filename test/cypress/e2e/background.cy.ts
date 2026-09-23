/**
 * The page must paint its own background. A top-level tab falls back to the
 * browser's white canvas, but inside an <iframe> (as here: Cypress runs the app
 * in one) the canvas is transparent, so a missing light-mode background lets
 * the embedding page show through.
 */
const themes: Array<[string, string]> = [
  ['light', 'rgb(255, 255, 255)'],
  ['dark', 'rgb(0, 0, 0)'],
]

describe('Page background', () => {
  themes.forEach(([theme, color]) => {
    it(`is opaque in ${theme} mode`, () => {
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('theme', theme)
        },
      })
      cy.get('html').should(theme === 'dark' ? 'have.class' : 'not.have.class', 'dark')
      cy.get('body').should('have.css', 'background-color', color)
    })
  })
})
