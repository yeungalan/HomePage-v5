import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    // The app is animation-heavy (motion/three.js); give pages room to settle.
    defaultCommandTimeout: 12000,
    pageLoadTimeout: 120000,
    requestTimeout: 15000,
    video: false,
    screenshotOnRunFailure: true,
    retries: {
      runMode: 2,
      openMode: 0,
    },
    setupNodeEvents() {
      // No custom node events needed yet.
    },
  },
})
