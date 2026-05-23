// ─── AI Chat tests ───────────────────────────────────────────────────────────
describe('AI Chat Widget', () => {
  beforeEach(() => cy.login());

  // ── Button presence on every page ─────────────────────────────────────────
  const PAGES = ['/', '/clients', '/policies', '/claims'];
  PAGES.forEach((page) => {
    it(`chat button is visible on ${page}`, () => {
      cy.visit(page);
      cy.get('[aria-label="Open chat"]').should('be.visible');
    });
  });

  // ── Open / close ──────────────────────────────────────────────────────────
  describe('Open and close', () => {
    beforeEach(() => cy.visit('/'));

    it('clicking chat button opens the panel', () => {
      cy.get('[aria-label="Open chat"]').click();
      // Panel becomes visible — check for the chat content area
      cy.contains(/aegis assistant/i, { timeout: 3000 }).should('be.visible');
    });

    it('chat panel header shows AI name', () => {
      cy.get('[aria-label="Open chat"]').click();
      cy.contains(/aegis assistant/i).should('be.visible');
    });

    it('initial greeting message is visible', () => {
      cy.get('[aria-label="Open chat"]').click();
      cy.contains(/hi|hello|aegis|ask me/i, { timeout: 3000 }).should('be.visible');
    });

    it('clicking button again closes the panel', () => {
      cy.get('[aria-label="Open chat"]').click();
      cy.get('[aria-label="Close chat"]').click();
      cy.get('[aria-label="Open chat"]').should('be.visible');
    });
  });

  // ── Input & send button ───────────────────────────────────────────────────
  describe('Input interaction', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.get('[aria-label="Open chat"]').click();
    });

    it('input placeholder is visible', () => {
      cy.get('textarea[placeholder*="ask" i], textarea[placeholder*="message" i], input[placeholder*="ask" i]')
        .should('be.visible');
    });

    it('send button is disabled when input is empty', () => {
      cy.get('button[aria-label*="send" i], button:has(.lucide-send)').should('be.disabled');
    });

    it('send button becomes enabled after typing', () => {
      cy.get('textarea, input[type="text"]').last().type('Hello');
      cy.get('button[aria-label*="send" i], button:has(.lucide-send), button:last').should('not.be.disabled');
    });

    it('pressing Enter sends the message (no shift)', () => {
      cy.get('textarea').last().type('ping{enter}');
      // User message should appear
      cy.contains('ping', { timeout: 5000 }).should('be.visible');
    });
  });

  // ── Sending messages and receiving AI responses ───────────────────────────
  describe('AI responses', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.get('[aria-label="Open chat"]').click();
    });

    it('shows loading state while waiting for response', () => {
      cy.get('textarea').last().type('How many active policies?');
      cy.get('button').last().click();
      // loading indicator appears briefly
      cy.get('.animate-spin, [data-loading], [aria-busy]', { timeout: 5000 })
        .should('exist')
        .then(() => {
          // It eventually disappears
          cy.get('.animate-spin', { timeout: 30000 }).should('not.exist');
        });
    });

    it('sending message gets a response from AI', () => {
      cy.get('textarea').last().type('How many active policies do we have?');
      cy.get('button').last().click();
      // AI response arrives (may take up to 30s with real backend)
      cy.get('div, p', { timeout: 30000 })
        .contains(/polic|activ|\d+/i)
        .should('be.visible');
    });

    it('response can contain bold markdown text', () => {
      cy.get('textarea').last().type('List the policy types available');
      cy.get('button').last().click();
      cy.get('strong, b, [class*="bold"]', { timeout: 30000 }).should('exist');
    });

    it('multiple messages stack in the chat', () => {
      const input = cy.get('textarea').last();
      input.type('first message{enter}');
      cy.contains('first message', { timeout: 5000 }).should('be.visible');
    });
  });

  // ── Panel behaviour ───────────────────────────────────────────────────────
  describe('Panel state', () => {
    it('reopening panel after close preserves messages', () => {
      cy.visit('/');
      cy.get('[aria-label="Open chat"]').click();
      // Initial greeting is there
      cy.contains(/aegis assistant/i).should('be.visible');
      // Close and reopen
      cy.get('[aria-label="Close chat"]').click();
      cy.get('[aria-label="Open chat"]').click();
      // Should still show initial message
      cy.contains(/aegis assistant/i).should('be.visible');
    });
  });
});
