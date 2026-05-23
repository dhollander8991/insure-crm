import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    viewportWidth: 1440,
    viewportHeight: 900,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 12000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    setupNodeEvents(on, config) {
      // Image snapshot plugin (graceful fallback if not available)
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { addMatchImageSnapshotPlugin } = require('cypress-image-snapshot/plugin');
        addMatchImageSnapshotPlugin(on, config);
      } catch {
        // plugin not compatible — visual tests will use cy.screenshot() instead
      }
      return config;
    },
    env: {
      agentEmail: 'agent@insure.com',
      agentPassword: 'secret123',
      authUrl: 'http://35.157.14.12:8081',
      customerUrl: 'http://35.157.14.12:8082',
      policyUrl: 'http://35.157.14.12:8083',
      aiUrl: 'http://35.157.14.12:8084',
    },
  },
});
