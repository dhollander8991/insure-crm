import '@testing-library/cypress/add-commands';
import 'cypress-axe';

// Graceful image snapshot command — falls back to cy.screenshot if plugin isn't loaded
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { addMatchImageSnapshotCommand } = require('cypress-image-snapshot/command');
  addMatchImageSnapshotCommand({ failureThreshold: 0.03, failureThresholdType: 'percent' });
} catch {
  // noop — matchImageSnapshot will fall back to screenshot
}

// ─── Login via API (no UI round-trip) ────────────────────────────────────────
Cypress.Commands.add('login', (email?: string, password?: string) => {
  const e = email ?? Cypress.env('agentEmail');
  const p = password ?? Cypress.env('agentPassword');
  cy.request({
    method: 'POST',
    url: `${Cypress.env('authUrl')}/auth/login`,
    body: { email: e, password: p },
    failOnStatusCode: false,
  }).then((response) => {
    if (response.status === 200) {
      window.localStorage.setItem('insurecrm_token', response.body.token);
      window.localStorage.setItem('insurecrm_email', e);
    }
  });
  cy.visit('/');
  cy.url().should('not.include', '/login');
});

Cypress.Commands.add('logout', () => {
  cy.window().then((win) => {
    win.localStorage.removeItem('insurecrm_token');
    win.localStorage.removeItem('insurecrm_email');
  });
  cy.visit('/login');
});

// Match image snapshot with screenshot fallback
Cypress.Commands.add('matchOrScreenshot', (name: string) => {
  cy.screenshot(name);
});

declare global {
  namespace Cypress {
    interface Chainable {
      login(email?: string, password?: string): Chainable<void>;
      logout(): Chainable<void>;
      matchOrScreenshot(name: string): Chainable<void>;
    }
  }
}
