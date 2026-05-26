// ─── Contract tests ───────────────────────────────────────────────────────────
// Intercept outgoing requests and verify exact body shapes and headers.
// These tests catch regressions where the frontend sends the wrong payload.
export {};

describe('Contract Tests — Request Shapes', () => {
  // ── AI chat contract ────────────────────────────────────────────────────────
  describe('AI Chat', () => {
    beforeEach(() => cy.login());

    it('sends { message: string } not { messages: array }', () => {
      cy.intercept('POST', '/api/ai/chat').as('aiChat');

      cy.visit('/');
      cy.get('[data-testid="ai-chat-button"]').click();
      cy.get('[data-testid="ai-chat-input"]').type('How many clients?');
      cy.get('[data-testid="ai-chat-send"]').click();

      cy.wait('@aiChat').then((interception) => {
        const body = interception.request.body;
        expect(body).to.have.property('message').and.be.a('string').and.have.length.above(0);
        expect(body).to.satisfy(
          (b: Record<string, unknown>) => !('messages' in b),
          'body must not contain "messages" key',
        );
      });
    });

    it('includes Authorization Bearer header', () => {
      cy.intercept('POST', '/api/ai/chat').as('aiChat');

      cy.visit('/');
      cy.get('[data-testid="ai-chat-button"]').click();
      cy.get('[data-testid="ai-chat-input"]').type('test');
      cy.get('[data-testid="ai-chat-send"]').click();

      cy.wait('@aiChat').then((interception) => {
        const auth = interception.request.headers['authorization'] as string;
        expect(auth).to.match(/^Bearer .{10,}$/);
      });
    });
  });

  // ── Auth login contract ─────────────────────────────────────────────────────
  describe('Auth Login', () => {
    it('sends { email, password } to /api/auth/login', () => {
      cy.intercept('POST', '/api/auth/login').as('login');

      cy.visit('/login');
      cy.get('[data-testid="email-input"]').type(Cypress.env('agentEmail'));
      cy.get('[data-testid="password-input"]').type(Cypress.env('agentPassword'));
      cy.get('[data-testid="login-button"]').click();

      cy.wait('@login').then((interception) => {
        const body = interception.request.body;
        expect(body).to.have.property('email').and.be.a('string');
        expect(body).to.have.property('password').and.be.a('string');
        expect(Object.keys(body).sort()).to.deep.equal(['email', 'password']);
      });
    });
  });

  // ── Create customer contract ────────────────────────────────────────────────
  describe('Create Customer', () => {
    beforeEach(() => cy.login());

    it('sends all required fields including agentEmail', () => {
      cy.intercept('POST', '/api/customers').as('createCustomer');

      cy.visit('/clients');
      cy.get('[data-testid="add-customer-button"]').click();
      cy.get('[data-testid="firstName-input"]').type('Contract');
      cy.get('[data-testid="lastName-input"]').type('Test');
      cy.get('[data-testid="email-input"]').type(`contract.${Date.now()}@test.io`);
      cy.get('[data-testid="phone-input"]').type('050-1234567');
      cy.get('[data-testid="israeliId-input"]').type('123456789');
      cy.get('input[id="dateOfBirth"]').type('1990-01-01');
      cy.get('[data-testid="submit-button"]').click();

      cy.wait('@createCustomer').then((interception) => {
        const body = interception.request.body;
        const required = ['firstName', 'lastName', 'email', 'phone', 'israeliId', 'dateOfBirth', 'agentEmail'];
        required.forEach((field) => {
          expect(body).to.have.property(field);
        });
        expect(body.agentEmail).to.be.a('string').and.have.length.above(3);
      });
    });

    it('includes Authorization Bearer header on GET /api/customers', () => {
      cy.intercept('GET', '/api/customers').as('getCustomers');
      cy.visit('/clients');
      cy.wait('@getCustomers').then((interception) => {
        const auth = interception.request.headers['authorization'] as string;
        expect(auth).to.match(/^Bearer .{10,}$/);
      });
    });
  });

  // ── Create policy contract ──────────────────────────────────────────────────
  describe('Create Policy', () => {
    beforeEach(() => cy.login());

    it('sends required fields and does NOT send policyNumber', () => {
      cy.intercept('POST', '/api/policies').as('createPolicy');

      cy.visit('/policies');
      cy.get('[data-testid="add-policy-button"]').click();

      cy.get('[data-testid="customerId-input"]').type('1');
      cy.get('[data-testid="customerName-input"]').type('Test Customer');
      cy.get('[data-testid="startDate-input"]').type('2025-01-01');
      cy.get('[data-testid="endDate-input"]').type('2026-01-01');
      cy.get('[data-testid="premium-input"]').type('500');
      cy.get('[data-testid="submit-button"]').click();

      cy.wait('@createPolicy').then((interception) => {
        const body = interception.request.body;
        const required = ['customerId', 'customerName', 'type', 'status', 'startDate', 'endDate', 'premium', 'agentEmail'];
        required.forEach((field) => {
          expect(body).to.have.property(field);
        });
        expect(body).to.not.have.property('policyNumber');
        expect(body.premium).to.be.a('number').and.be.gt(0);
      });
    });
  });
});

// ─── Pagination response shape contracts ─────────────────────────────────────
describe('Contract Tests — Pagination Response Shape', () => {
  beforeEach(() => cy.login());

  it('GET /api/customers response contains paginated content array', () => {
    cy.intercept('GET', '/api/customers').as('getCustomers');
    cy.visit('/clients');
    cy.wait('@getCustomers').then((interception) => {
      const body = interception.response?.body;
      expect(body).to.have.property('content').and.be.an('array');
      expect(body).to.have.property('totalElements').and.be.a('number');
      expect(body).to.have.property('totalPages').and.be.a('number');
      expect(body).to.have.property('size').and.be.a('number');
      expect(body).to.have.property('number').and.be.a('number');
    });
  });

  it('Clients page renders rows (not raw paginated object)', () => {
    cy.visit('/clients');
    cy.get('[data-testid="customers-table"]', { timeout: 10000 }).should('exist');
    cy.get('[data-testid="customers-table"] tbody tr').should('have.length.gte', 1);
    cy.contains(/\d+ of \d+ contacts/).should('exist');
  });

  it('GET /api/policies response contains paginated content array', () => {
    cy.intercept('GET', '/api/policies').as('getPolicies');
    cy.visit('/policies');
    cy.wait('@getPolicies').then((interception) => {
      const body = interception.response?.body;
      expect(body).to.have.property('content').and.be.an('array');
      expect(body).to.have.property('totalElements').and.be.a('number');
      expect(body).to.have.property('totalPages').and.be.a('number');
    });
  });

  it('Policies page renders rows (not raw paginated object)', () => {
    cy.visit('/policies');
    cy.get('table tbody tr', { timeout: 10000 }).should('have.length.gte', 1);
    cy.contains(/\d+ of \d+ policies/).should('exist');
  });

  it('Dashboard computes KPIs from paginated customer + policy data', () => {
    cy.visit('/');
    cy.get('[data-testid="kpi-active-policies"]', { timeout: 10000 }).should('exist');
    cy.get('[data-testid="kpi-total-premium"]').should('exist');
    cy.get('[data-testid="kpi-total-customers"]').should('exist');
  });
});
