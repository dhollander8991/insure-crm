import './commands';
import 'cypress-real-events';

// Suppress uncaught exceptions from third-party libraries that shouldn't fail tests
Cypress.on('uncaught:exception', (err) => {
  // ResizeObserver loop errors from charts are benign
  if (err.message.includes('ResizeObserver')) return false;
  // framer-motion animation errors in test environment
  if (err.message.includes('motion')) return false;
  return true;
});

// Log all API requests during test run
beforeEach(() => {
  cy.intercept({ resourceType: 'xhr' }, (req) => {
    req.continue();
  }).as('apiCalls');
});
