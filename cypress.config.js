const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    env: {
      // Test user credentials
      adminUsername: process.env.CYPRESS_ADMIN_USERNAME || 'admin',
      adminPassword: process.env.CYPRESS_ADMIN_PASSWORD || 'admin123',
      staffUsername: process.env.CYPRESS_STAFF_USERNAME || 'staff',
      staffPassword: process.env.CYPRESS_STAFF_PASSWORD || 'staff123',
      customerUsername: process.env.CYPRESS_CUSTOMER_USERNAME || 'customer',
      customerPassword: process.env.CYPRESS_CUSTOMER_PASSWORD || 'customer123'
    },
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
