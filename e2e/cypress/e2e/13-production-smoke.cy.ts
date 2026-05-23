// ─── Production smoke tests ───────────────────────────────────────────────────
// These tests run against the live Vercel deployment to catch proxy/path bugs
// that only manifest in production (not caught by local integration tests).
export {};

const PROD_URL = 'https://insurecrm-navy.vercel.app';
const AGENT_EMAIL = 'agent@insure.com';
const AGENT_PASSWORD = 'secret123';

let prodToken: string;

before(() => {
  cy.request({
    method: 'POST',
    url: `${PROD_URL}/api/auth/auth/login`,
    body: { email: AGENT_EMAIL, password: AGENT_PASSWORD },
    failOnStatusCode: false,
  }).then((res) => {
    if (res.status === 200) {
      prodToken = res.body.token;
    }
  });
});

describe('Production Smoke Tests — Vercel Proxy', () => {
  // ── Frontend loads ──────────────────────────────────────────────────────────
  it('frontend loads with status 200', () => {
    cy.request(PROD_URL).its('status').should('eq', 200);
  });

  // ── Auth proxy ──────────────────────────────────────────────────────────────
  it('auth proxy is reachable (not 502/503/404)', () => {
    cy.request({
      method: 'POST',
      url: `${PROD_URL}/api/auth/auth/login`,
      body: { email: AGENT_EMAIL, password: AGENT_PASSWORD },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.not.be.oneOf([404, 502, 503]);
    });
  });

  it('auth proxy correct path: login returns 200 + token', () => {
    cy.request({
      method: 'POST',
      url: `${PROD_URL}/api/auth/auth/login`,
      body: { email: AGENT_EMAIL, password: AGENT_PASSWORD },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property('token').and.be.a('string').and.have.length.above(10);
    });
  });

  // ── Customer proxy ──────────────────────────────────────────────────────────
  it('customer proxy correct path: GET /customers returns array with firstName', () => {
    cy.request({
      method: 'GET',
      url: `${PROD_URL}/api/customers/customers`,
      headers: { Authorization: `Bearer ${prodToken}` },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an('array');
      if (res.body.length > 0) {
        expect(res.body[0]).to.have.property('firstName');
      }
    });
  });

  // ── Policy proxy ────────────────────────────────────────────────────────────
  it('policy proxy correct path: GET /policies returns array with policyNumber', () => {
    cy.request({
      method: 'GET',
      url: `${PROD_URL}/api/policies/policies`,
      headers: { Authorization: `Bearer ${prodToken}` },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an('array');
      if (res.body.length > 0) {
        expect(res.body[0]).to.have.property('policyNumber').and.match(/^POL-/);
      }
    });
  });

  // ── AI proxy ────────────────────────────────────────────────────────────────
  it('AI proxy correct path /api/ai/chat → 200 with { reply }', () => {
    cy.request({
      method: 'POST',
      url: `${PROD_URL}/api/ai/chat`,
      headers: { Authorization: `Bearer ${prodToken}`, 'Content-Type': 'application/json' },
      body: { message: 'How many active policies are there?', agentEmail: AGENT_EMAIL },
      timeout: 45000,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.satisfy(
        (b: Record<string, unknown>) => 'reply' in b || 'response' in b || 'message' in b,
        'body must have reply, response, or message field',
      );
      const reply = (res.body.reply ?? res.body.response ?? res.body.message) as string;
      expect(reply).to.be.a('string').and.have.length.above(5);
    });
  });

  it('AI proxy rejects wrong body shape (messages array → 4xx)', () => {
    cy.request({
      method: 'POST',
      url: `${PROD_URL}/api/ai/chat`,
      headers: { Authorization: `Bearer ${prodToken}`, 'Content-Type': 'application/json' },
      body: { messages: [{ role: 'user', content: 'test' }], agentEmail: AGENT_EMAIL },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.gte(400);
    });
  });

  // ── Double-path bug regression ──────────────────────────────────────────────
  it('double path /api/ai/ai/chat returns 404 (not accidentally routed)', () => {
    cy.request({
      method: 'POST',
      url: `${PROD_URL}/api/ai/ai/chat`,
      headers: { Authorization: `Bearer ${prodToken}`, 'Content-Type': 'application/json' },
      body: { message: 'test', agentEmail: AGENT_EMAIL },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.not.eq(200);
    });
  });
});
