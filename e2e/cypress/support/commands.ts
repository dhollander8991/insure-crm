import '@testing-library/cypress/add-commands';
import 'cypress-axe';

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

// Visual snapshot comparison via pixelmatch.
// First run saves the baseline; subsequent runs diff against it (3% threshold).
Cypress.Commands.add('matchVisualSnapshot', (snapshotName: string) => {
  const screenshotsFolder = Cypress.config('screenshotsFolder') as string;
  const specName = Cypress.spec.relative.split('/').pop()!;
  cy.screenshot(snapshotName, { overwrite: true });
  cy.task('compareSnapshots', {
    snapshotName,
    screenshotPath: `${screenshotsFolder}/${specName}/${snapshotName}.png`,
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      login(email?: string, password?: string): Chainable<void>;
      logout(): Chainable<void>;
      matchVisualSnapshot(snapshotName: string): Chainable<void>;
    }
  }
}
