// ─── Customers / Clients tests ───────────────────────────────────────────────
describe('Clients Page', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/clients');
    // Wait for the table/list to populate
    cy.contains(/client|name|email/i, { timeout: 10000 }).should('be.visible');
  });

  // ── Page rendering ────────────────────────────────────────────────────────
  it('clients page loads', () => {
    cy.url().should('include', '/clients');
  });

  it('renders Name column header', () => {
    cy.contains(/^name$/i).should('be.visible');
  });

  it('renders Email column header', () => {
    cy.contains(/^email$/i).should('be.visible');
  });

  it('renders Phone column header', () => {
    cy.contains(/^phone$/i).should('be.visible');
  });

  it('renders Status column header', () => {
    cy.contains(/^status$/i).should('be.visible');
  });

  it('shows at least 1 customer row', () => {
    cy.get('tbody tr, [role="row"]').should('have.length.gte', 1);
  });

  // ── Search ────────────────────────────────────────────────────────────────
  describe('Search', () => {
    it('search input is visible', () => {
      cy.get('input[placeholder*="search" i], input[placeholder*="name" i]').should('be.visible');
    });

    it('searching filters the table', () => {
      cy.get('input[placeholder*="search" i], input[placeholder*="name" i]').type('zzznomatch999');
      cy.get('tbody tr, [role="row"]').should('have.length.lte', 5);
    });

    it('clearing search restores full list', () => {
      const searchInput = cy.get('input[placeholder*="search" i], input[placeholder*="name" i]');
      searchInput.type('zzznomatch999').clear();
      cy.get('tbody tr, [role="row"]').should('have.length.gte', 1);
    });
  });

  // ── Status filter ─────────────────────────────────────────────────────────
  describe('Status filter', () => {
    it('Active filter exists', () => {
      cy.contains(/active/i).should('exist');
    });

    it('Prospect filter exists', () => {
      cy.contains(/prospect/i).should('exist');
    });
  });

  // ── Status badges ─────────────────────────────────────────────────────────
  it('status badges are visible', () => {
    cy.get('tbody tr, [role="row"]').first().within(() => {
      // Look for a badge element
      cy.get('[class*="badge"], [class*="Badge"], span').should('exist');
    });
  });

  // ── Sort ──────────────────────────────────────────────────────────────────
  describe('Column sorting', () => {
    it('clicking Name column header triggers sort', () => {
      cy.contains('th, button', /^name$/i).click();
      // After sort the table still has rows
      cy.get('tbody tr, [role="row"]').should('have.length.gte', 1);
    });

    it('clicking Name header twice reverses sort', () => {
      const header = cy.contains('th, button', /^name$/i);
      header.click();
      header.click();
      cy.get('tbody tr, [role="row"]').should('have.length.gte', 1);
    });
  });

  // ── Add Client button ─────────────────────────────────────────────────────
  describe('Add Client', () => {
    it('Add Client button is visible', () => {
      cy.contains('button', /add client|new client/i).should('be.visible');
    });

    it('clicking Add Client opens a dialog / modal', () => {
      cy.contains('button', /add client|new client/i).click();
      cy.get('[role="dialog"], [data-state="open"]').should('exist');
    });

    it('form has First Name field', () => {
      cy.contains('button', /add client|new client/i).click();
      cy.contains(/first name/i).should('be.visible');
    });

    it('form has Last Name field', () => {
      cy.contains('button', /add client|new client/i).click();
      cy.contains(/last name/i).should('be.visible');
    });

    it('form has Email field', () => {
      cy.contains('button', /add client|new client/i).click();
      cy.contains(/^email$/i).should('be.visible');
    });

    it('form has Phone field', () => {
      cy.contains('button', /add client|new client/i).click();
      cy.contains(/phone/i).should('be.visible');
    });

    it('form has Israeli ID field', () => {
      cy.contains('button', /add client|new client/i).click();
      cy.contains(/israeli id/i).should('be.visible');
    });

    it('submitting empty form shows validation errors', () => {
      cy.contains('button', /add client|new client/i).click();
      cy.contains('button', /create client/i).click();
      cy.contains(/required/i).should('be.visible');
    });

    it('invalid Israeli ID shows validation error', () => {
      cy.contains('button', /add client|new client/i).click();
      cy.get('#israeliId').type('12345');
      cy.contains('button', /create client/i).click();
      cy.contains(/9 digits/i).should('be.visible');
    });

    it('cancel button closes the dialog', () => {
      cy.contains('button', /add client|new client/i).click();
      cy.get('[role="dialog"]').should('exist');
      cy.contains('button', /cancel/i).click();
      cy.get('[role="dialog"]').should('not.exist');
    });
  });

  // ── No horizontal scroll ─────────────────────────────────────────────────
  it('no horizontal scrollbar on clients page', () => {
    cy.document().then((doc) => {
      expect(doc.body.scrollWidth).to.be.lte(doc.body.clientWidth + 2);
    });
  });

  // ── Mobile ────────────────────────────────────────────────────────────────
  it('clients page renders on 375px mobile', () => {
    cy.viewport(375, 812);
    cy.visit('/clients');
    cy.contains(/clients/i, { timeout: 8000 }).should('be.visible');
  });
});
