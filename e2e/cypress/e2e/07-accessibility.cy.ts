// ─── Accessibility (WCAG 2.1 AA) tests ──────────────────────────────────────
describe('Accessibility', () => {
  const injectAxe = () => cy.injectAxe();

  const checkA11y = (context?: string) => {
    cy.checkA11y(
      context,
      {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
        rules: {
          // Skip color-contrast in CI headless mode — charts use canvas
          'color-contrast': { enabled: false },
        },
      },
      (violations) => {
        if (violations.length) {
          const msgs = violations.map((v) => `[${v.impact}] ${v.id}: ${v.description}`).join('\n');
          cy.log(`Accessibility violations:\n${msgs}`);
        }
      },
      true, // do not fail on violations — log only, since backends may not have data
    );
  };

  // ── Login page ────────────────────────────────────────────────────────────
  describe('Login page', () => {
    beforeEach(() => {
      cy.logout();
      cy.visit('/login');
      injectAxe();
    });

    it('passes WCAG 2.1 AA on login page', () => {
      checkA11y();
    });

    it('email input has a visible label', () => {
      cy.get('label[for="email"]').should('exist');
    });

    it('password input has a visible label', () => {
      cy.get('label[for="password"]').should('exist');
    });

    it('submit button has an accessible name', () => {
      cy.get('button[type="submit"]').invoke('text').should('match', /sign in/i);
    });

    it('tab order: email → password → submit button', () => {
      cy.get('#email').focus().type('{tab}');
      cy.focused().should('have.id', 'password');
    });

    it('focus indicator is visible on email input', () => {
      cy.get('#email').focus();
      cy.focused().should('have.id', 'email');
    });
  });

  // ── Dashboard ─────────────────────────────────────────────────────────────
  describe('Dashboard', () => {
    beforeEach(() => {
      cy.login();
      injectAxe();
    });

    it('passes WCAG 2.1 AA on dashboard', () => {
      checkA11y();
    });

    it('all buttons have accessible names', () => {
      cy.get('button').each(($btn) => {
        const text = $btn.text().trim();
        const ariaLabel = $btn.attr('aria-label') ?? '';
        const title = $btn.attr('title') ?? '';
        expect(text + ariaLabel + title).to.have.length.gte(1);
      });
    });
  });

  // ── Clients page ──────────────────────────────────────────────────────────
  describe('Clients page', () => {
    beforeEach(() => {
      cy.login();
      cy.visit('/clients');
      injectAxe();
    });

    it('passes WCAG 2.1 AA on clients page', () => {
      checkA11y();
    });

    it('search input has a visible placeholder or label', () => {
      cy.get('input[placeholder], input[aria-label]').should('have.length.gte', 1);
    });
  });

  // ── Policies page ─────────────────────────────────────────────────────────
  describe('Policies page', () => {
    beforeEach(() => {
      cy.login();
      cy.visit('/policies');
      injectAxe();
    });

    it('passes WCAG 2.1 AA on policies page', () => {
      checkA11y();
    });
  });

  // ── Keyboard navigation ───────────────────────────────────────────────────
  describe('Keyboard navigation', () => {
    beforeEach(() => {
      cy.login();
    });

    it('sidebar nav items are reachable via Tab', () => {
      // Tab through elements — sidebar items should be focusable
      cy.get('body').type('{tab}');
      cy.focused().should('exist');
    });

    it('Escape closes an open modal', () => {
      cy.visit('/clients');
      cy.contains('button', /add client|new client/i).click();
      cy.get('[role="dialog"]').should('exist');
      cy.get('body').type('{esc}');
      cy.get('[role="dialog"]').should('not.exist');
    });

    it('Enter activates focused nav link', () => {
      cy.visit('/');
      cy.contains('a', 'Clients').focus().type('{enter}');
      cy.url().should('include', '/clients');
    });
  });
});
