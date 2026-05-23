// ─── Direct API integration tests ────────────────────────────────────────────
// These tests bypass the UI and hit the backend services directly.
// They verify contract correctness, status codes, and response shapes.
export {};

const AUTH = () => Cypress.env('authUrl') as string;
const CUST = () => Cypress.env('customerUrl') as string;
const POL = () => Cypress.env('policyUrl') as string;
const AI = () => Cypress.env('aiUrl') as string;

let authToken: string;
let createdCustomerId: number;
let createdPolicyId: number;

// Obtain a real token once before all tests
before(() => {
  cy.request({
    method: 'POST',
    url: `${AUTH()}/auth/login`,
    body: { email: Cypress.env('agentEmail'), password: Cypress.env('agentPassword') },
  }).then((res) => {
    authToken = res.body.token;
  });
});

// ─── Auth Service ─────────────────────────────────────────────────────────────
describe('API — Auth Service', () => {
  it('POST /auth/login valid credentials → 200 + token', () => {
    cy.request({
      method: 'POST',
      url: `${AUTH()}/auth/login`,
      body: { email: Cypress.env('agentEmail'), password: Cypress.env('agentPassword') },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property('token').and.be.a('string').and.have.length.above(10);
      expect(res.body).to.have.property('email', Cypress.env('agentEmail'));
    });
  });

  it('POST /auth/login wrong password → 4xx + error', () => {
    cy.request({
      method: 'POST',
      url: `${AUTH()}/auth/login`,
      body: { email: Cypress.env('agentEmail'), password: 'totally_wrong_pw' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.gte(400).and.be.lt(500);
      expect(res.body).to.satisfy((b: Record<string, unknown>) => 'error' in b || 'message' in b);
    });
  });

  it('POST /auth/login missing email → 4xx', () => {
    cy.request({
      method: 'POST',
      url: `${AUTH()}/auth/login`,
      body: { password: 'test123' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.gte(400);
    });
  });

  it('POST /auth/register new unique email → 201 + token', () => {
    const unique = `cypress.reg.${Date.now()}@test.io`;
    cy.request({
      method: 'POST',
      url: `${AUTH()}/auth/register`,
      body: { email: unique, password: 'cypress123' },
      failOnStatusCode: false,
    }).then((res) => {
      expect([200, 201]).to.include(res.status);
      expect(res.body).to.have.property('token').and.be.a('string');
    });
  });

  it('POST /auth/register duplicate email → 4xx + error', () => {
    cy.request({
      method: 'POST',
      url: `${AUTH()}/auth/register`,
      body: { email: Cypress.env('agentEmail'), password: 'whatever123' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.gte(400);
    });
  });
});

// ─── Customer Service ─────────────────────────────────────────────────────────
describe('API — Customer Service', () => {
  it('GET /customers → 200 + array', () => {
    cy.request({
      method: 'GET',
      url: `${CUST()}/customers`,
      headers: { Authorization: `Bearer ${authToken}` },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an('array');
    });
  });

  it('GET /customers returns at least 1 customer', () => {
    cy.request({
      method: 'GET',
      url: `${CUST()}/customers`,
      headers: { Authorization: `Bearer ${authToken}` },
    }).then((res) => {
      expect(res.body.length).to.be.gte(1);
    });
  });

  it('GET /customers/:id returns customer object', () => {
    // Get the first customer's id
    cy.request({
      method: 'GET',
      url: `${CUST()}/customers`,
      headers: { Authorization: `Bearer ${authToken}` },
    }).then((res) => {
      const firstId = res.body[0].id;
      cy.request({
        method: 'GET',
        url: `${CUST()}/customers/${firstId}`,
        headers: { Authorization: `Bearer ${authToken}` },
      }).then((detail) => {
        expect(detail.status).to.eq(200);
        ['id', 'firstName', 'lastName', 'email', 'phone'].forEach((k) => {
          expect(detail.body).to.have.property(k);
        });
      });
    });
  });

  it('GET /customers/999999 → 4xx (not found)', () => {
    cy.request({
      method: 'GET',
      url: `${CUST()}/customers/999999`,
      headers: { Authorization: `Bearer ${authToken}` },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.gte(400);
    });
  });

  it('POST /customers valid → 201 + customer with id', () => {
    cy.fixture('test-customer').then((customer) => {
      const unique = { ...customer, email: `cy.${Date.now()}@test.io`, israeliId: `${Math.floor(100000000 + Math.random() * 900000000)}` };
      cy.request({
        method: 'POST',
        url: `${CUST()}/customers`,
        headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
        body: unique,
        failOnStatusCode: false,
      }).then((res) => {
        expect([200, 201]).to.include(res.status);
        expect(res.body).to.have.property('id').and.be.a('number');
        createdCustomerId = res.body.id;
      });
    });
  });

  it('POST /customers invalid phone format → 4xx', () => {
    cy.fixture('test-customer').then((customer) => {
      cy.request({
        method: 'POST',
        url: `${CUST()}/customers`,
        headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
        body: { ...customer, email: `ph.${Date.now()}@test.io`, phone: '12345' },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.be.gte(400);
      });
    });
  });

  it('POST /customers invalid israeliId (not 9 digits) → 4xx', () => {
    cy.fixture('test-customer').then((customer) => {
      cy.request({
        method: 'POST',
        url: `${CUST()}/customers`,
        headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
        body: { ...customer, email: `id.${Date.now()}@test.io`, israeliId: '12345' },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.be.gte(400);
      });
    });
  });

  it('PUT /customers/:id → 200 + updated data', () => {
    if (!createdCustomerId) {
      cy.log('Skipping PUT — no customer was created in this run');
      return;
    }
    cy.request({
      method: 'PUT',
      url: `${CUST()}/customers/${createdCustomerId}`,
      headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
      body: { firstName: 'Updated', lastName: 'E2E' },
      failOnStatusCode: false,
    }).then((res) => {
      expect([200, 204]).to.include(res.status);
    });
  });

  it('DELETE /customers/:id → 204', () => {
    if (!createdCustomerId) {
      cy.log('Skipping DELETE — no customer was created in this run');
      return;
    }
    cy.request({
      method: 'DELETE',
      url: `${CUST()}/customers/${createdCustomerId}`,
      headers: { Authorization: `Bearer ${authToken}` },
      failOnStatusCode: false,
    }).then((res) => {
      expect([200, 204]).to.include(res.status);
    });
  });
});

// ─── Policy Service ───────────────────────────────────────────────────────────
describe('API — Policy Service', () => {
  it('GET /policies → 200 + array', () => {
    cy.request({
      method: 'GET',
      url: `${POL()}/policies`,
      headers: { Authorization: `Bearer ${authToken}` },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an('array');
    });
  });

  it('GET /policies returns at least 1 policy', () => {
    cy.request({
      method: 'GET',
      url: `${POL()}/policies`,
      headers: { Authorization: `Bearer ${authToken}` },
    }).then((res) => {
      expect(res.body.length).to.be.gte(1);
    });
  });

  it('GET /policies/:id returns policy object', () => {
    cy.request({
      method: 'GET',
      url: `${POL()}/policies`,
      headers: { Authorization: `Bearer ${authToken}` },
    }).then((res) => {
      const firstId = res.body[0].id;
      cy.request({
        method: 'GET',
        url: `${POL()}/policies/${firstId}`,
        headers: { Authorization: `Bearer ${authToken}` },
      }).then((detail) => {
        expect(detail.status).to.eq(200);
        expect(detail.body).to.have.property('policyNumber').and.match(/^POL-/);
        expect(detail.body).to.have.property('premium').and.be.a('number');
      });
    });
  });

  it('GET /policies/customer/:id returns array of policies', () => {
    cy.request({
      method: 'GET',
      url: `${CUST()}/customers`,
      headers: { Authorization: `Bearer ${authToken}` },
    }).then((custRes) => {
      const firstCustId = custRes.body[0].id;
      cy.request({
        method: 'GET',
        url: `${POL()}/policies/customer/${firstCustId}`,
        headers: { Authorization: `Bearer ${authToken}` },
        failOnStatusCode: false,
      }).then((res) => {
        expect([200, 204]).to.include(res.status);
        if (res.status === 200) {
          expect(res.body).to.be.an('array');
        }
      });
    });
  });

  it('POST /policies valid → 201 + policy with POL- prefix', () => {
    cy.request({
      method: 'GET',
      url: `${CUST()}/customers`,
      headers: { Authorization: `Bearer ${authToken}` },
    }).then((custRes) => {
      const cust = custRes.body[0];
      cy.request({
        method: 'POST',
        url: `${POL()}/policies`,
        headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
        body: {
          customerId: cust.id,
          customerName: `${cust.firstName} ${cust.lastName}`,
          type: 'HEALTH',
          status: 'ACTIVE',
          startDate: '2025-01-01',
          endDate: '2026-01-01',
          premium: 300,
          agentEmail: Cypress.env('agentEmail'),
        },
        failOnStatusCode: false,
      }).then((res) => {
        expect([200, 201]).to.include(res.status);
        if (res.status === 201 || res.status === 200) {
          expect(res.body.policyNumber).to.match(/^POL-/);
          createdPolicyId = res.body.id;
        }
      });
    });
  });

  it('POST /policies invalid customerId 999999 → 4xx', () => {
    cy.request({
      method: 'POST',
      url: `${POL()}/policies`,
      headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
      body: {
        customerId: 999999, customerName: 'Nobody', type: 'LIFE',
        status: 'ACTIVE', startDate: '2025-01-01', endDate: '2026-01-01',
        premium: 100, agentEmail: Cypress.env('agentEmail'),
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.gte(400);
    });
  });

  it('POST /policies negative premium → 4xx', () => {
    cy.request({
      method: 'GET',
      url: `${CUST()}/customers`,
      headers: { Authorization: `Bearer ${authToken}` },
    }).then((custRes) => {
      const cust = custRes.body[0];
      cy.request({
        method: 'POST',
        url: `${POL()}/policies`,
        headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
        body: {
          customerId: cust.id, customerName: `${cust.firstName} ${cust.lastName}`,
          type: 'CAR', status: 'ACTIVE', startDate: '2025-01-01', endDate: '2026-01-01',
          premium: -500, agentEmail: Cypress.env('agentEmail'),
        },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.be.gte(400);
      });
    });
  });

  it('DELETE /policies/:id → 204', () => {
    if (!createdPolicyId) {
      cy.log('Skipping DELETE policy — none created in this run');
      return;
    }
    cy.request({
      method: 'DELETE',
      url: `${POL()}/policies/${createdPolicyId}`,
      headers: { Authorization: `Bearer ${authToken}` },
      failOnStatusCode: false,
    }).then((res) => {
      expect([200, 204]).to.include(res.status);
    });
  });
});

// ─── AI Service ───────────────────────────────────────────────────────────────
describe('API — AI Service', () => {
  it('POST /ai/chat with valid message → 200 + reply', () => {
    cy.request({
      method: 'POST',
      url: `${AI()}/ai/chat`,
      headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
      body: { message: 'How many customers are in the system?', history: [] },
      timeout: 30000,
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.satisfy((b: Record<string, unknown>) => 'reply' in b || 'response' in b);
      const reply = res.body.reply ?? res.body.response;
      expect(reply).to.be.a('string').and.have.length.above(5);
    });
  });

  it('POST /ai/chat empty message → 4xx', () => {
    cy.request({
      method: 'POST',
      url: `${AI()}/ai/chat`,
      headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
      body: { message: '', history: [] },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.gte(400);
    });
  });
});
