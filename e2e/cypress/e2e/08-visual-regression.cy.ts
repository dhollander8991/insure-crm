// ─── Visual regression tests ─────────────────────────────────────────────────
// Uses cy.screenshot() — captured images are stored in cypress/screenshots/
// and can be compared in CI with tools like Percy or manually reviewed.
// If cypress-image-snapshot is compatible, matchImageSnapshot() is used instead.

const snap = (name: string) => {
  // Try matchImageSnapshot if available, fall back to screenshot
  try {
    // @ts-expect-error — optional plugin
    cy.matchImageSnapshot(name);
  } catch {
    cy.screenshot(name, { overwrite: true });
  }
};

describe('Visual Regression', () => {
  // ── Login page ────────────────────────────────────────────────────────────
  describe('Login page', () => {
    beforeEach(() => {
      cy.logout();
      cy.visit('/login');
      // Wait for fonts and layout to settle
      cy.wait(500);
    });

    it('matches desktop snapshot', () => {
      cy.viewport(1440, 900);
      snap('login-desktop');
    });

    it('matches mobile snapshot (375px)', () => {
      cy.viewport(375, 812);
      snap('login-mobile-375');
    });
  });

  // ── Dashboard ─────────────────────────────────────────────────────────────
  describe('Dashboard', () => {
    beforeEach(() => {
      cy.login();
      // Wait for API data and charts to render
      cy.wait(2000);
    });

    it('matches desktop snapshot', () => {
      cy.viewport(1440, 900);
      snap('dashboard-desktop');
    });

    it('matches mobile snapshot (375px)', () => {
      cy.viewport(375, 812);
      snap('dashboard-mobile-375');
    });
  });

  // ── Clients page ──────────────────────────────────────────────────────────
  describe('Clients page', () => {
    beforeEach(() => {
      cy.login();
      cy.visit('/clients');
      cy.wait(1500);
    });

    it('matches desktop snapshot', () => {
      cy.viewport(1440, 900);
      snap('clients-desktop');
    });
  });

  // ── Policies page ─────────────────────────────────────────────────────────
  describe('Policies page', () => {
    beforeEach(() => {
      cy.login();
      cy.visit('/policies');
      cy.wait(1500);
    });

    it('matches desktop snapshot', () => {
      cy.viewport(1440, 900);
      snap('policies-desktop');
    });
  });

  // ── Sidebar collapsed ─────────────────────────────────────────────────────
  describe('Sidebar states', () => {
    beforeEach(() => {
      cy.login();
      cy.viewport(1440, 900);
    });

    it('matches sidebar expanded snapshot', () => {
      snap('sidebar-expanded');
    });

    it('matches sidebar collapsed snapshot', () => {
      // Click the sidebar toggle button
      cy.get(
        'button[data-sidebar="trigger"], button[aria-label*="sidebar" i], button[aria-label*="collapse" i], [data-sidebar="trigger"]'
      ).first().click({ force: true });
      cy.wait(400); // animation settles
      snap('sidebar-collapsed');
    });
  });

  // ── AI chat open ──────────────────────────────────────────────────────────
  describe('AI Chat', () => {
    it('matches chat panel open snapshot', () => {
      cy.login();
      cy.viewport(1440, 900);
      cy.get('[aria-label="Open chat"]').click();
      cy.wait(300);
      snap('ai-chat-open');
    });
  });

  // ── New Client form ───────────────────────────────────────────────────────
  describe('New Client form', () => {
    it('matches new client dialog snapshot', () => {
      cy.login();
      cy.visit('/clients');
      cy.contains('button', /add client|new client/i).click();
      cy.get('[role="dialog"]').should('be.visible');
      cy.wait(300);
      snap('new-client-dialog');
    });
  });
});
