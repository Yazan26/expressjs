describe('Authentication System', () => {
  
  describe('Login Form', () => {
    beforeEach(() => {
      cy.visit('/auth/login');
    });

    it('displays login form with demo credentials', () => {
      cy.get('h2').should('contain', 'Login');
      cy.get('input[name="username"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('contain', 'Login');
      
      // Demo credentials should be visible
      cy.get('.alert-info')
        .should('contain', 'Demo Accounts')
        .and('contain', 'mike')
        .and('contain', 'staff123');
    });

    it('shows validation for invalid credentials', () => {
      cy.fillForm({
        username: 'invalid',
        password: 'wrongpass'
      });
      cy.submitForm();
      
      cy.url().should('include', '/auth/login');
      cy.checkAlert('error', 'Invalid credentials');
    });
  });

  describe('User Login', () => {
    it('allows staff login with redirect to users page', () => {
      cy.login('staff');
      cy.url().should('include', '/users');
      cy.get('.navbar').should('contain', 'Mike Hillyer');
      cy.get('.badge').should('contain', 'Staff');
    });

    it('allows customer login with redirect to home', () => {
      cy.login('customer');
      cy.get('.navbar').should('contain', 'Customer');
    });

    it('allows admin login with full access', () => {
      cy.login('admin');
      cy.get('.navbar').should('contain', 'Admin');
    });
  });

  describe('Authentication Flow', () => {
    it('logs out successfully', () => {
      cy.login('staff');
      cy.checkAuth(true);
      cy.logout();
      cy.checkAlert('success', 'logged out');
    });

    it('protects user management routes', () => {
      cy.visit('/users');
      cy.url().should('include', '/auth/login');
      cy.checkAlert('warning', 'Please log in');
    });

    it('redirects authenticated users away from login', () => {
      cy.login('staff');
      cy.visit('/auth/login');
      cy.url().should('not.include', '/auth/login');
    });
  });
});