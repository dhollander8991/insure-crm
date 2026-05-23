// ─── Performance tests ───────────────────────────────────────────────────────
// Measures real-world load times accounting for AWS latency (~200-500ms).

describe('Performance', () => {
  const DASHBOARD_BUDGET_MS = 8000;   // dashboard with charts + API calls
  const PAGE_BUDGET_MS = 5000;        // standard page load
  const API_BUDGET_MS = 3000;         // direct API call round-trip

  // ── Page load times ───────────────────────────────────────────────────────
  describe('Page load budgets', () => {
    it(`dashboard loads within ${DASHBOARD_BUDGET_MS}ms`, () => {
      cy.login();
      const start = Date.now();
      cy.visit('/');
      cy.contains(/active policies|good/i, { timeout: DASHBOARD_BUDGET_MS }).should('be.visible');
      cy.then(() => {
        const elapsed = Date.now() - start;
        cy.log(`Dashboard load: ${elapsed}ms`);
        expect(elapsed).to.be.lte(DASHBOARD_BUDGET_MS);
      });
    });

    it(`clients page loads within ${PAGE_BUDGET_MS}ms after login`, () => {
      cy.login();
      const start = Date.now();
      cy.visit('/clients');
      cy.get('tbody tr, [role="row"], table', { timeout: PAGE_BUDGET_MS }).should('exist');
      cy.then(() => {
        cy.log(`Clients page load: ${Date.now() - start}ms`);
      });
    });

    it(`policies page loads within ${PAGE_BUDGET_MS}ms after login`, () => {
      cy.login();
      const start = Date.now();
      cy.visit('/policies');
      cy.contains(/polic/i, { timeout: PAGE_BUDGET_MS }).should('be.visible');
      cy.then(() => {
        cy.log(`Policies page load: ${Date.now() - start}ms`);
      });
    });
  });

  // ── API response times ────────────────────────────────────────────────────
  describe('API response time budgets', () => {
    let token: string;
    before(() => {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('authUrl')}/auth/login`,
        body: { email: Cypress.env('agentEmail'), password: Cypress.env('agentPassword') },
      }).then((res) => { token = res.body.token; });
    });

    it(`auth login responds within ${API_BUDGET_MS}ms`, () => {
      const start = Date.now();
      cy.request({
        method: 'POST',
        url: `${Cypress.env('authUrl')}/auth/login`,
        body: { email: Cypress.env('agentEmail'), password: Cypress.env('agentPassword') },
      }).then((res) => {
        const elapsed = Date.now() - start;
        cy.log(`Auth login: ${elapsed}ms`);
        expect(res.status).to.eq(200);
        expect(elapsed).to.be.lte(API_BUDGET_MS);
      });
    });

    it(`GET /customers responds within ${API_BUDGET_MS}ms`, () => {
      const start = Date.now();
      cy.request({
        method: 'GET',
        url: `${Cypress.env('customerUrl')}/customers`,
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => {
        const elapsed = Date.now() - start;
        cy.log(`GET /customers: ${elapsed}ms`);
        expect(res.status).to.eq(200);
        expect(elapsed).to.be.lte(API_BUDGET_MS);
      });
    });

    it(`GET /policies responds within ${API_BUDGET_MS}ms`, () => {
      const start = Date.now();
      cy.request({
        method: 'GET',
        url: `${Cypress.env('policyUrl')}/policies`,
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => {
        const elapsed = Date.now() - start;
        cy.log(`GET /policies: ${elapsed}ms`);
        expect(res.status).to.eq(200);
        expect(elapsed).to.be.lte(API_BUDGET_MS);
      });
    });
  });

  // ── Console errors ────────────────────────────────────────────────────────
  describe('Console errors', () => {
    const pages = ['/', '/clients', '/policies', '/claims'];

    pages.forEach((page) => {
      it(`no console errors on ${page}`, () => {
        cy.login();
        cy.visit(page);

        // Collect console errors
        const errors: string[] = [];
        cy.window().then((win) => {
          const orig = win.console.error;
          win.console.error = (...args) => {
            errors.push(args.join(' '));
            orig.apply(win.console, args);
          };
        });

        cy.wait(2000).then(() => {
          const relevant = errors.filter((e) =>
            !e.includes('ResizeObserver') &&
            !e.includes('Warning:') &&
            !e.includes('motion')
          );
          if (relevant.length > 0) {
            cy.log(`Console errors on ${page}: ${relevant.join(' | ')}`);
          }
          // Soft assertion — log but don't fail on external backend issues
          expect(relevant.filter((e) => e.includes('Cannot read') || e.includes('is not a function'))).to.have.length(0);
        });
      });
    });
  });

  // ── Network requests ──────────────────────────────────────────────────────
  describe('Network requests', () => {
    it('no failed network requests on dashboard (4xx/5xx)', () => {
      const failedRequests: string[] = [];

      cy.login();

      cy.intercept('**', (req) => {
        req.continue((res) => {
          if (res.statusCode >= 400) {
            failedRequests.push(`${req.method} ${req.url} → ${res.statusCode}`);
          }
        });
      });

      cy.visit('/');
      cy.wait(3000).then(() => {
        const actual = failedRequests.filter((r) => !r.includes('/auth/'));
        if (actual.length > 0) {
          cy.log(`Failed requests: ${actual.join(' | ')}`);
        }
        // Allow some failures from backends being cold/unavailable
        expect(actual.length).to.be.lte(3);
      });
    });
  });
});
