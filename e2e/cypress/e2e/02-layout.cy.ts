// ─── Layout & Navigation tests ───────────────────────────────────────────────
describe('Layout & Navigation', () => {
  beforeEach(() => cy.login());

  // ── Sidebar ───────────────────────────────────────────────────────────────
  describe('Sidebar', () => {
    it('sidebar is visible on dashboard', () => {
      cy.get('nav, aside, [data-sidebar]').should('exist');
    });

    it('sidebar contains Dashboard nav item', () => {
      cy.contains('a, button', 'Dashboard').should('be.visible');
    });

    it('sidebar contains Clients nav item', () => {
      cy.contains('a, button', 'Clients').should('be.visible');
    });

    it('sidebar contains Policies nav item', () => {
      cy.contains('a, button', 'Policies').should('be.visible');
    });

    it('sidebar contains Claims nav item', () => {
      cy.contains('a, button', 'Claims').should('be.visible');
    });

    it('clicking Clients navigates to /clients', () => {
      cy.contains('a', 'Clients').click();
      cy.url().should('include', '/clients');
    });

    it('clicking Policies navigates to /policies', () => {
      cy.contains('a', 'Policies').click();
      cy.url().should('include', '/policies');
    });

    it('clicking Claims navigates to /claims', () => {
      cy.contains('a', 'Claims').click();
      cy.url().should('include', '/claims');
    });

    it('clicking Dashboard navigates to /', () => {
      cy.visit('/clients');
      cy.contains('a', 'Dashboard').click();
      cy.url().should('eq', Cypress.config('baseUrl') + '/');
    });

    it('active nav item is visually highlighted', () => {
      cy.visit('/clients');
      // Active sidebar button has aria-current or a highlighted class
      cy.get('[data-state="active"], [aria-current="page"], [data-active="true"]')
        .should('exist');
    });
  });

  // ── Sidebar collapse ──────────────────────────────────────────────────────
  describe('Sidebar collapse', () => {
    it('collapse trigger exists', () => {
      // The sidebar toggle button exists somewhere in the layout
      cy.get('button[data-sidebar="trigger"], button[data-testid="sidebar-toggle"], [aria-label*="sidebar" i], [aria-label*="collapse" i]')
        .should('exist');
    });

    it('sidebar text labels are visible when expanded', () => {
      cy.contains('Dashboard').should('be.visible');
      cy.contains('Clients').should('be.visible');
    });
  });

  // ── Scroll & overflow ─────────────────────────────────────────────────────
  describe('Scroll & overflow', () => {
    const pages = ['/', '/clients', '/policies', '/claims'];

    pages.forEach((page) => {
      it(`no horizontal scrollbar on ${page}`, () => {
        cy.visit(page);
        cy.document().then((doc) => {
          const body = doc.body;
          // scrollWidth > clientWidth means horizontal overflow
          expect(body.scrollWidth).to.be.lte(body.clientWidth + 1);
        });
      });
    });

    it('content area fills available width on dashboard', () => {
      cy.visit('/');
      cy.get('main, [role="main"]').then(($main) => {
        expect($main[0].clientWidth).to.be.greaterThan(600);
      });
    });
  });

  // ── AI chat button omnipresence ───────────────────────────────────────────
  describe('AI chat button', () => {
    const pages = ['/', '/clients', '/policies', '/claims'];

    pages.forEach((page) => {
      it(`chat button visible on ${page}`, () => {
        cy.visit(page);
        cy.get('[aria-label="Open chat"]').should('be.visible');
      });
    });
  });

  // ── Responsive behaviour ──────────────────────────────────────────────────
  describe('Responsive', () => {
    it('no horizontal scroll at 375px (mobile)', () => {
      cy.viewport(375, 812);
      cy.visit('/');
      cy.document().then((doc) => {
        expect(doc.body.scrollWidth).to.be.lte(375 + 1);
      });
    });

    it('layout renders at 768px (tablet)', () => {
      cy.viewport(768, 1024);
      cy.visit('/');
      cy.get('main, [role="main"]').should('be.visible');
    });
  });
});
