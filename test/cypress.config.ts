import { defineConfig } from 'cypress'

export default defineConfig({
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'cypress/reports',
    reportFilename: 'mochawesome',
    charts: false,
    overwrite: true,
    html: true,
    // Keeps cypress/reports/mochawesome.json alongside the HTML report, so
    // scripts/generate-pr-comment.mjs has a machine-readable summary to
    // build the PR comment from.
    saveJson: true,
    embeddedScreenshots: true,
    inlineAssets: true,
  },
  e2e: {
    baseUrl: 'http://localhost:3000',
    // The app is animation-heavy (motion/three.js); give pages room to settle.
    defaultCommandTimeout: 12000,
    pageLoadTimeout: 120000,
    requestTimeout: 15000,
    // The header is position:fixed; Cypress's default "scroll to top" before a
    // click would place footer controls underneath it, so the click lands on
    // the header instead. Centering the target in the viewport keeps it clear.
    scrollBehavior: 'center',
    video: false,
    screenshotOnRunFailure: true,
    retries: {
      runMode: 2,
      openMode: 0,
    },
    setupNodeEvents(on) {
      require('cypress-mochawesome-reporter/plugin')(on)
    },
  },
})
