/**
 * Cypress support file, loaded before every e2e spec.
 *
 * The site renders a lot of motion/three.js content; a few of those libraries
 * throw benign ResizeObserver / WebGL errors in headless Chrome that would
 * otherwise fail the test even though the page itself is fine. We swallow only
 * those known-benign errors and let everything else fail the run as usual.
 */
Cypress.on('uncaught:exception', (err) => {
  const benign = [
    'ResizeObserver loop',
    'WebGL',
    'Could not load the WebGL', // react-globe.gl / three.js in headless
  ]
  if (benign.some((message) => err.message.includes(message))) {
    return false
  }
  return undefined
})
