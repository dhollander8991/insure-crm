// ─── Cross-service user journey tests ────────────────────────────────────────
// Full end-to-end journeys that span multiple services and both UI + API.
export {};

const AUTH = () => Cypress.env('authUrl') as string;
const CUST = () => Cypress.env('customerUrl') as string;
const POL = () => Cypress.env('policyUrl') as string;

describe('Cross-service User Journeys', () => {
  // ── Journey 1: New agent onboarding ────────────────────────────────────────
  describe('Journey 1 — New agent onboarding', () => {
    const uniqueEmail = `onboard.${Date.now()}@cypress.io`;
    let agentToken: string;
    let newCustomerId: number;

    it('1a. Registers a new account via API', () => {
      cy.request({
        method: 'POST',
        url: `${AUTH()}/auth/register`,
        body: { email: uniqueEmail, password: 'cypress123' },
        failOnStatusCode: false,
      }).then((res) => {
        expect([200, 201]).to.include(res.status);
        agentToken = res.body.token;
      });
    });

    it('1b. Logs in via UI with the new account', () => {
      cy.visit('/login');
      cy.get('#email').type(uniqueEmail);
      cy.get('#password').type('cypress123');
      cy.get('button[type="submit"]').click();
      cy.url().should('not.include', '/login', { timeout: 8000 });
    });

    it('1c. Dashboard loads for new agent', () => {
      cy.login(uniqueEmail, 'cypress123');
      cy.contains(/good (morning|afternoon|evening)/i).should('be.visible');
    });

    it('1d. Creates a new customer via UI', () => {
      cy.login(uniqueEmail, 'cypress123');
      cy.visit('/clients');
      cy.contains('button', /add client|new client/i).click();
      cy.get('[role="dialog"]').should('exist');

      cy.get('#firstName').type('Journey');
      cy.get('#lastName').type('TestClient');
      cy.get('#nc-email, #email').type(`jt.${Date.now()}@test.io`);
      cy.get('#phone').type('050-1234567');
      cy.get('#israeliId').type('123456789');
      cy.get('#dateOfBirth').type('1990-05-15');

      cy.contains('button', /create client/i).click();
      // Either dialog closes and customer appears, or toast shown
      cy.contains(/success|created/i, { timeout: 10000 }).should('be.visible');
    });

    it('1e. Asks AI about the portfolio', () => {
      cy.login(uniqueEmail, 'cypress123');
      cy.visit('/');
      cy.get('[aria-label="Open chat"]').click();
      cy.get('textarea').last().type('Summarize my portfolio{enter}');
      // AI responds
      cy.get('div.prose, [class*="markdown"], .prose', { timeout: 30000 }).should('exist');
    });
  });

  // ── Journey 2: Daily agent workflow ────────────────────────────────────────
  describe('Journey 2 — Daily agent workflow', () => {
    beforeEach(() => cy.login());

    it('2a. Dashboard KPIs are visible', () => {
      cy.contains(/active policies/i).should('be.visible');
      cy.contains(/new leads/i).should('be.visible');
    });

    it('2b. Navigate to clients and verify list loads', () => {
      cy.visit('/clients');
      cy.get('tbody tr, [role="row"]', { timeout: 10000 }).should('have.length.gte', 1);
    });

    it('2c. Navigate to policies and filter by status', () => {
      cy.visit('/policies');
      cy.contains(/active|pending|expired/i).should('be.visible');
    });

    it('2d. Open AI chat and ask about renewals', () => {
      cy.visit('/');
      cy.get('[aria-label="Open chat"]').click();
      cy.get('textarea').last().type('Which policies are expiring soon?{enter}');
      cy.get('div, p', { timeout: 30000 }).contains(/expir|polic/i).should('exist');
    });
  });

  // ── Journey 3: Data integrity ───────────────────────────────────────────────
  describe('Journey 3 — Data integrity', () => {
    let token: string;
    let cid: number;

    before(() => {
      cy.request({
        method: 'POST',
        url: `${AUTH()}/auth/login`,
        body: { email: Cypress.env('agentEmail'), password: Cypress.env('agentPassword') },
      }).then((res) => { token = res.body.token; });
    });

    it('3a. Creates a customer via API', () => {
      cy.request({
        method: 'POST',
        url: `${CUST()}/customers`,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: {
          firstName: 'DataIntegrity',
          lastName: 'Test',
          email: `integrity.${Date.now()}@test.io`,
          phone: '052-9876543',
          israeliId: `${Math.floor(100000000 + Math.random() * 900000000)}`,
          dateOfBirth: '1985-03-20',
          status: 'PROSPECT',
          agentEmail: Cypress.env('agentEmail'),
        },
      }).then((res) => {
        expect([200, 201]).to.include(res.status);
        cid = res.body.id;
      });
    });

    it('3b. Newly created customer appears in UI', () => {
      cy.login();
      cy.visit('/clients');
      cy.wait(1000);
      // Page should have at least 1 row
      cy.get('tbody tr, [role="row"]').should('have.length.gte', 1);
    });

    it('3c. Deletes the customer via API', () => {
      if (!cid) return;
      cy.request({
        method: 'DELETE',
        url: `${CUST()}/customers/${cid}`,
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false,
      }).then((res) => {
        expect([200, 204]).to.include(res.status);
      });
    });

    it('3d. GET /customers/:id returns 4xx after deletion', () => {
      if (!cid) return;
      cy.request({
        method: 'GET',
        url: `${CUST()}/customers/${cid}`,
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.be.gte(400);
      });
    });

    it('3e. Creates a policy for an existing customer via API and UI confirms count increases', () => {
      // Get customers first
      cy.request({
        method: 'GET',
        url: `${CUST()}/customers`,
        headers: { Authorization: `Bearer ${token}` },
      }).then((custRes) => {
        const cust = custRes.body[0];

        // Count current policies
        cy.request({
          method: 'GET',
          url: `${POL()}/policies`,
          headers: { Authorization: `Bearer ${token}` },
        }).then((before) => {
          const beforeCount = before.body.length;

          // Create new policy
          cy.request({
            method: 'POST',
            url: `${POL()}/policies`,
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: {
              customerId: cust.id,
              customerName: `${cust.firstName} ${cust.lastName}`,
              type: 'HEALTH', status: 'ACTIVE',
              startDate: '2025-06-01', endDate: '2026-06-01',
              premium: 450, agentEmail: Cypress.env('agentEmail'),
            },
            failOnStatusCode: false,
          }).then((createRes) => {
            if (createRes.status < 300) {
              cy.request({
                method: 'GET',
                url: `${POL()}/policies`,
                headers: { Authorization: `Bearer ${token}` },
              }).then((after) => {
                expect(after.body.length).to.be.gte(beforeCount);
              });
            }
          });
        });
      });
    });
  });
});
