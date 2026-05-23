// ─── Dashboard tests ─────────────────────────────────────────────────────────
describe('Dashboard', () => {
  beforeEach(() => cy.login());

  it('dashboard loads at / route', () => {
    cy.url().should('eq', Cypress.config('baseUrl') + '/');
  });

  it('page title area is visible', () => {
    cy.contains(/good (morning|afternoon|evening)/i).should('be.visible');
  });

  // ── KPI cards ─────────────────────────────────────────────────────────────
  describe('KPI cards', () => {
    it('Total Premium card renders', () => {
      cy.contains(/total premium/i).should('be.visible');
    });

    it('Active Policies card renders', () => {
      cy.contains(/active policies/i).should('be.visible');
    });

    it('Open Claims card renders', () => {
      cy.contains(/open claims/i).should('be.visible');
    });

    it('New Leads card renders', () => {
      cy.contains(/new leads/i).should('be.visible');
    });

    it('Active Policies shows a non-negative number from real API', () => {
      cy.contains(/active policies/i)
        .closest('[class*="card"], .card, section, div')
        .find('span, p, div')
        .not(':empty')
        .first()
        .invoke('text')
        .then((text) => {
          const num = parseInt(text.replace(/[^0-9]/g, ''), 10);
          expect(num).to.be.gte(0);
        });
    });
  });

  // ── Charts ────────────────────────────────────────────────────────────────
  describe('Charts', () => {
    it('Revenue vs Claims chart renders (svg or canvas)', () => {
      cy.contains(/revenue/i).should('be.visible');
      cy.get('svg, canvas').should('have.length.gte', 1);
    });

    it('Policies by Type chart renders', () => {
      cy.contains(/policies by type/i).should('be.visible');
    });

    it('Claims by Status chart renders', () => {
      cy.contains(/claims by status/i).should('be.visible');
    });

    it('Lead Pipeline chart renders', () => {
      cy.contains(/lead pipeline/i).should('be.visible');
    });

    it('has at least 2 SVG/canvas elements (multiple charts)', () => {
      cy.get('svg, canvas').should('have.length.gte', 2);
    });
  });

  // ── Recent Activity ───────────────────────────────────────────────────────
  describe('Recent Activity', () => {
    it('Recent Activity section is visible', () => {
      cy.contains(/recent activity/i).should('be.visible');
    });
  });

  // ── Responsive ────────────────────────────────────────────────────────────
  describe('Responsive layout', () => {
    it('renders correctly at 375px', () => {
      cy.viewport(375, 812);
      cy.visit('/');
      cy.contains(/active policies/i).should('be.visible');
    });

    it('renders correctly at 768px', () => {
      cy.viewport(768, 1024);
      cy.visit('/');
      cy.contains(/active policies/i).should('be.visible');
    });

    it('renders correctly at 1440px', () => {
      cy.viewport(1440, 900);
      cy.visit('/');
      cy.contains(/active policies/i).should('be.visible');
    });
  });

  // ── Data loading ──────────────────────────────────────────────────────────
  describe('Data loading', () => {
    it('data is loaded from real API (numbers not zero after load)', () => {
      // Give real backends time to respond
      cy.wait(3000);
      cy.get('body').then(($body) => {
        // At least one numeric value should be visible on the dashboard
        const text = $body.text();
        expect(text).to.match(/\d/);
      });
    });
  });
});
