/**
 * /world renders World.tsx (react-globe.gl / three.js), loaded client-only
 * via next/dynamic. WebGL is flaky under headless Chrome (see support/e2e.ts
 * for the errors it's known to throw there), so this only asserts the page
 * mounts a canvas and doesn't crash — not pixel-level globe behaviour.
 */
describe('World page (globe)', () => {
  it('mounts a WebGL canvas without crashing', () => {
    cy.visit('/world')
    cy.get('canvas', { timeout: 20000 }).should('exist')
  })

  it('does not get stuck on the dynamic-import loading fallback', () => {
    cy.visit('/world')
    cy.contains('Loading map...', { timeout: 20000 }).should('not.exist')
  })
})
