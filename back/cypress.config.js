const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    env: {
      apiUrl: 'http://localhost:5000'
    },
    specPattern: 'tests/e2e/cypress/integration/**/*.cy.js',
    supportFile: false,
    fixturesFolder: 'tests/e2e/cypress/fixtures', // Asegúrate de que esta línea esté presente
    experimentalInteractiveRunEvents: true,
    defaultCommandTimeout: 20000,
    requestTimeout: 20000
  }
})
