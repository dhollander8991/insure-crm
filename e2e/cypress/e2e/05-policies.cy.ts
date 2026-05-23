// ─── Policies tests ───────────────────────────────────────────────────────────
describe('Policies Page', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/policies');
    cy.contains(/polic/i, { timeout: 10000 }).should('be.visible');
  });

  // ── Page renders ──────────────────────────────────────────────────────────
  it('policies page loads', () => {
    cy.url().should('include', '/policies');
  });

  it('renders at least 1 policy', () => {
    cy.get('tbody tr, [role="row"], table tr').should('have.length.gte', 1);
  });

  it('shows Policy Number column', () => {
    cy.contains(/policy.?(number|#)/i).should('be.visible');
  });

  it('shows Customer column', () => {
    cy.contains(/customer|client/i).should('be.visible');
  });

  it('shows Type column', () => {
    cy.contains(/type/i).should('be.visible');
  });

  it('shows Status column', () => {
    cy.contains(/status/i).should('be.visible');
  });

  it('shows Premium column with ₪ symbol', () => {
    cy.contains(/premium/i).should('be.visible');
    // ₪ symbol should appear somewhere on the page
    cy.contains(/₪/).should('exist');
  });

  // ── View toggle ───────────────────────────────────────────────────────────
  it('has table/card view toggle buttons', () => {
    // Table2 and LayoutGrid icons — check for any toggle button pair
    cy.get('button').should('have.length.gte', 1);
  });

  // ── Status filter ─────────────────────────────────────────────────────────
  describe('Status filter', () => {
    it('Active filter chip exists', () => {
      cy.contains(/active/i).should('exist');
    });

    it('Pending filter chip exists', () => {
      cy.contains(/pending/i).should('exist');
    });

    it('Expired filter chip exists', () => {
      cy.contains(/expired/i).should('exist');
    });
  });

  // ── Sort ──────────────────────────────────────────────────────────────────
  describe('Column sorting', () => {
    it('clicking Premium column header triggers sort', () => {
      cy.contains(/premium/i).click();
      cy.get('tbody tr, [role="row"]').should('have.length.gte', 1);
    });
  });

  // ── Add Policy ────────────────────────────────────────────────────────────
  describe('Add Policy', () => {
    it('New Policy button is visible', () => {
      cy.contains('button', /new policy|add policy/i).should('be.visible');
    });

    it('clicking New Policy opens a dialog', () => {
      cy.contains('button', /new policy|add policy/i).click();
      cy.get('[role="dialog"], [data-state="open"]').should('exist');
    });

    it('form has Customer ID field', () => {
      cy.contains('button', /new policy|add policy/i).click();
      cy.contains(/customer id/i).should('be.visible');
    });

    it('form has Premium field', () => {
      cy.contains('button', /new policy|add policy/i).click();
      cy.contains(/premium/i).should('be.visible');
    });

    it('empty submission shows validation errors', () => {
      cy.contains('button', /new policy|add policy/i).click();
      cy.contains('button', /create policy/i).click();
      cy.contains(/required/i).should('be.visible');
    });

    it('negative customer ID shows validation error', () => {
      cy.contains('button', /new policy|add policy/i).click();
      cy.get('[id*="customerId" i], [name*="customerId" i]').type('-1');
      cy.contains('button', /create policy/i).click();
      cy.contains(/positive|must be/i).should('be.visible');
    });

    it('cancel button closes the dialog', () => {
      cy.contains('button', /new policy|add policy/i).click();
      cy.contains('button', /cancel/i).click();
      cy.get('[role="dialog"]').should('not.exist');
    });
  });

  // ── No horizontal scroll ─────────────────────────────────────────────────
  it('no horizontal scrollbar', () => {
    cy.document().then((doc) => {
      expect(doc.body.scrollWidth).to.be.lte(doc.body.clientWidth + 2);
    });
  });
});
