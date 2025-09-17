describe('Authentication System', function() {
  beforeEach(function() {
    // Visit the login page before each test
    cy.visit('/auth/login');
  });

  it('should display login form with demo credentials', function() {
    cy.get('h2').should('contain', 'Login');
    cy.get('input[name="username"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('contain', 'Login');
    
    // Check demo credentials are displayed
    cy.get('.alert-info').should('contain', 'Demo Accounts');
    cy.get('.alert-info').should('contain', 'mike');
    cy.get('.alert-info').should('contain', 'staff123');
  });

  it('should successfully login with staff credentials', function() {
    // Fill in staff credentials
    cy.get('input[name="username"]').type('mike');
    cy.get('input[name="password"]').type('staff123');
    cy.get('button[type="submit"]').click();

    // Should redirect to users page (staff default)
    cy.url().should('include', '/users');
    
    // Check navigation shows user is logged in
    cy.get('.navbar').should('contain', 'Mike Hillyer');
    cy.get('.badge').should('contain', 'Staff');
  });

  it('should successfully login with customer credentials', function() {
    // Fill in customer credentials (using first customer email)
    cy.get('input[name="username"]').type('mary.smith@sakilacustomer.org');
    cy.get('input[name="password"]').type('customer123');
    cy.get('button[type="submit"]').click();

    // Should redirect to home page (customer default)
    cy.url().should('not.include', '/auth/login');
    
    // Check navigation shows user is logged in
    cy.get('.navbar').should('contain', 'Customer');
  });

  it('should show error for invalid credentials', function() {
    // Try invalid login
    cy.get('input[name="username"]').type('invalid');
    cy.get('input[name="password"]').type('wrongpass');
    cy.get('button[type="submit"]').click();

    // Should stay on login page with error
    cy.url().should('include', '/auth/login');
    cy.get('.alert-danger').should('contain', 'Invalid credentials');
  });

  it('should logout successfully', function() {
    // Login first
    cy.get('input[name="username"]').type('mike');
    cy.get('input[name="password"]').type('staff123');
    cy.get('button[type="submit"]').click();

    // Should be logged in
    cy.url().should('include', '/users');
    cy.get('.navbar').should('contain', 'Mike Hillyer');

    // Logout
    cy.get('a[href="/auth/logout"]').click();

    // Should be redirected to login
    cy.url().should('include', '/auth/login');
    cy.get('.alert-success').should('contain', 'logged out');
  });

  it('should protect user management routes', function() {
    // Try to access protected route without login
    cy.visit('/users');

    // Should be redirected to login
    cy.url().should('include', '/auth/login');
    cy.get('.alert-warning').should('contain', 'Please log in');
  });

  it('should redirect authenticated users away from login', function() {
    // Login first
    cy.get('input[name="username"]').type('mike');
    cy.get('input[name="password"]').type('staff123');
    cy.get('button[type="submit"]').click();

    // Now try to visit login page again
    cy.visit('/auth/login');

    // Should be redirected away from login
    cy.url().should('not.include', '/auth/login');
  });
});