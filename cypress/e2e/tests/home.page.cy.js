describe('Home Page', () => {
  
  describe('Public Access', () => {
    it('loads home page without authentication', () => {
      cy.visit('/');
      cy.get('h1').should('contain', 'Home Page');
      cy.checkContent('body', 'Welcome to the Home Page');
    });

    it('displays navigation elements', () => {
      cy.visit('/');
      cy.get('.navbar').should('be.visible');
      cy.get('a[href="/auth/login"]').should('be.visible');
      cy.get('a[href="/auth/register"]').should('be.visible');
    });
  });

  describe('Authenticated Access', () => {
    it('shows different content for logged-in users', () => {
      cy.login('staff');
      cy.visit('/');
      cy.get('.navbar').should('contain', 'Mike Hillyer');
      cy.get('a[href="/auth/logout"]').should('be.visible');
    });

    it('allows navigation to protected routes', () => {
      cy.login('staff');
      cy.visit('/');
      cy.get('a[href="/users"]').click();
      cy.url().should('include', '/users');
      cy.checkContent('body', 'Users List');
    });
  });

  describe('Role-Based Content', () => {
    it('shows admin-specific navigation for admin users', () => {
      cy.login('admin');
      cy.visit('/');
      cy.get('.navbar').should('contain', 'Admin');
    });

    it('shows customer-specific content for customers', () => {
      cy.login('customer');
      cy.visit('/');
      cy.get('.navbar').should('contain', 'Customer');
    });
  });
});