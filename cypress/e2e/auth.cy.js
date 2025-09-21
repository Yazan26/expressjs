describe('Authentication Flows', () => {
  context('Login page', () => {
    beforeEach(() => {
      cy.visit('/auth/login');
    });

    it('renders the login form with expected fields and links', () => {
      cy.contains('Sakila Video Store Login').should('be.visible');
      cy.get('input[name="username"]').should('have.attr', 'required');
      cy.get('input[name="password"]').should('have.attr', 'required');
      cy.contains('Remember me for 30 days').should('be.visible');
      cy.contains('Create New Account')
        .should('have.attr', 'href', '/auth/register');
    });

    it('shows a friendly error when submitting without credentials', () => {
      cy.contains('button', 'Sign In').click();
      cy.url().should('include', '/auth/login');
      cy.get('.alert-danger').should('contain', 'Username and password required');
    });

    it('rejects invalid credentials with a generic error', () => {
      cy.get('input[name="username"]').type('invalid-user');
      cy.get('input[name="password"]').type('wrong-password');
      cy.contains('button', 'Sign In').click();

      cy.url().should('include', '/auth/login');
      cy.get('.alert-danger').should('contain', 'Invalid username or password');
    });
  });

  context('Registration page', () => {
    beforeEach(() => {
      cy.visit('/auth/register');
    });

    it('requires all registration fields', () => {
      cy.get('input[name="firstName"]').should('have.attr', 'required');
      cy.get('input[name="lastName"]').should('have.attr', 'required');
      cy.get('input[name="email"]').should('have.attr', 'required');
      cy.get('input[name="username"]').should('have.attr', 'required');
      cy.get('input[name="password"]').should('have.attr', 'required');
      cy.get('input[name="confirmPassword"]').should('have.attr', 'required');
      cy.contains('Login here').should('have.attr', 'href', '/auth/login');
    });

    it('validates password confirmation mismatch', () => {
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="email"]').type('test.user@example.com');
      cy.get('input[name="username"]').type('testuser');
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="confirmPassword"]').type('password321');

      cy.contains('button', 'Register').click();
      cy.url().should('include', '/auth/register');
      cy.get('.alert-danger').should('contain', 'Passwords do not match');
    });

    it('enforces minimum password length', () => {
      cy.get('input[name="firstName"]').type('Short');
      cy.get('input[name="lastName"]').type('Password');
      cy.get('input[name="email"]').type('short.password@example.com');
      cy.get('input[name="username"]').type('shortpassuser');
      cy.get('input[name="password"]').type('123');
      cy.get('input[name="confirmPassword"]').type('123');

      cy.contains('button', 'Register').click();
      cy.url().should('include', '/auth/register');
      cy.get('.alert-danger').should('contain', 'Password must be at least 6 characters');
    });
  });
});
