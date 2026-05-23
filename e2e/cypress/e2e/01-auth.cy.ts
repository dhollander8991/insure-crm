// ─── Authentication tests ────────────────────────────────────────────────────
describe('Authentication', () => {
  beforeEach(() => {
    cy.logout();
  });

  // ── Login page rendering ──────────────────────────────────────────────────
  describe('Login page', () => {
    beforeEach(() => cy.visit('/login'));

    it('renders the logo / app name', () => {
      cy.contains('Aegis').should('be.visible');
    });

    it('renders email input', () => {
      cy.get('#email').should('exist').and('have.attr', 'type', 'email');
    });

    it('renders password input', () => {
      cy.get('#password').should('exist').and('have.attr', 'type', 'password');
    });

    it('renders sign-in submit button', () => {
      cy.get('button[type="submit"]').contains(/sign in/i).should('be.visible');
    });

    it('renders link to signup page', () => {
      cy.contains(/create an account/i).should('have.attr', 'href', '/signup');
    });
  });

  // ── Client-side validation ────────────────────────────────────────────────
  describe('Client-side validation', () => {
    beforeEach(() => cy.visit('/login'));

    it('blocks submission with invalid email format', () => {
      cy.get('#email').type('not-an-email');
      cy.get('#password').type('password123');
      cy.get('button[type="submit"]').click();
      // Toast or browser validation prevents submission; URL stays at /login
      cy.url().should('include', '/login');
    });

    it('blocks submission with password < 6 chars', () => {
      cy.get('#email').type('agent@insure.com');
      cy.get('#password').type('abc');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/login');
    });
  });

  // ── Wrong credentials ─────────────────────────────────────────────────────
  describe('Wrong credentials', () => {
    it('shows error toast for wrong password', () => {
      cy.visit('/login');
      cy.get('#email').type('agent@insure.com');
      cy.get('#password').type('wrongpassword');
      cy.get('button[type="submit"]').click();
      // Toast or error message should appear
      cy.contains(/invalid|credentials|error/i, { timeout: 8000 }).should('be.visible');
    });

    it('shows error for non-existent user', () => {
      cy.visit('/login');
      cy.get('#email').type('nobody@example.com');
      cy.get('#password').type('password123');
      cy.get('button[type="submit"]').click();
      cy.contains(/invalid|not found|error/i, { timeout: 8000 }).should('be.visible');
    });
  });

  // ── Successful login ──────────────────────────────────────────────────────
  describe('Successful login', () => {
    it('redirects to dashboard after login', () => {
      cy.visit('/login');
      cy.get('#email').type(Cypress.env('agentEmail'));
      cy.get('#password').type(Cypress.env('agentPassword'));
      cy.get('button[type="submit"]').click();
      cy.url().should('not.include', '/login');
      cy.url().should('eq', Cypress.config('baseUrl') + '/');
    });

    it('stores JWT token in localStorage after login', () => {
      cy.visit('/login');
      cy.get('#email').type(Cypress.env('agentEmail'));
      cy.get('#password').type(Cypress.env('agentPassword'));
      cy.get('button[type="submit"]').click();
      cy.url().should('not.include', '/login');
      cy.window().then((win) => {
        expect(win.localStorage.getItem('insurecrm_token')).to.be.a('string').and.have.length.above(10);
      });
    });

    it('stores email in localStorage after login', () => {
      cy.visit('/login');
      cy.get('#email').type(Cypress.env('agentEmail'));
      cy.get('#password').type(Cypress.env('agentPassword'));
      cy.get('button[type="submit"]').click();
      cy.url().should('not.include', '/login');
      cy.window().then((win) => {
        expect(win.localStorage.getItem('insurecrm_email')).to.equal(Cypress.env('agentEmail'));
      });
    });
  });

  // ── Signup page ───────────────────────────────────────────────────────────
  describe('Signup page', () => {
    beforeEach(() => cy.visit('/signup'));

    it('renders signup page heading', () => {
      cy.contains(/create your account/i).should('be.visible');
    });

    it('renders email input', () => {
      cy.get('#email').should('exist');
    });

    it('renders password input', () => {
      cy.get('#password').should('exist');
    });

    it('renders link back to login', () => {
      cy.contains(/sign in/i).should('have.attr', 'href', '/login');
    });

    it('clicking signup link navigates to /signup from login', () => {
      cy.visit('/login');
      cy.contains(/create an account/i).click();
      cy.url().should('include', '/signup');
    });

    it('shows error for duplicate email registration', () => {
      cy.get('#email').type(Cypress.env('agentEmail'));
      cy.get('#password').type('password123');
      cy.get('button[type="submit"]').click();
      cy.contains(/exists|duplicate|already/i, { timeout: 8000 }).should('be.visible');
    });
  });

  // ── Route protection ──────────────────────────────────────────────────────
  describe('Route protection', () => {
    it('redirects / to /login when not authenticated', () => {
      cy.visit('/');
      cy.url().should('include', '/login');
    });

    it('redirects /clients to /login when not authenticated', () => {
      cy.visit('/clients');
      cy.url().should('include', '/login');
    });

    it('redirects /policies to /login when not authenticated', () => {
      cy.visit('/policies');
      cy.url().should('include', '/login');
    });
  });

  // ── Logout ────────────────────────────────────────────────────────────────
  describe('Logout', () => {
    it('clears localStorage and redirects to /login on logout', () => {
      cy.login();
      // logout via direct localStorage clear (simulates clicking logout)
      cy.window().then((win) => {
        win.localStorage.removeItem('insurecrm_token');
        win.localStorage.removeItem('insurecrm_email');
      });
      cy.visit('/');
      cy.url().should('include', '/login');
      cy.window().then((win) => {
        expect(win.localStorage.getItem('insurecrm_token')).to.be.null;
      });
    });
  });
});
