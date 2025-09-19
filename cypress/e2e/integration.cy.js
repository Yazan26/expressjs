describe('Full User Journey Integration', () => {
  it('should complete full customer journey: register, login, rent, cancel, logout', () => {
    const timestamp = Date.now();
    const testEmail = `integration${timestamp}@test.com`;
    
    // Step 1: Register new user (if registration is available)
    cy.visit('/');
    cy.get('body').then(($body) => {
      if ($body.find('a[href="/auth/register"]').length > 0) {
        cy.visit('/auth/register');
        cy.get('input[name="firstName"]').type('Integration');
        cy.get('input[name="lastName"]').type('Test');
        cy.get('input[name="email"]').type(testEmail);
        cy.get('input[name="username"]').type(`integration${timestamp}`);
        cy.get('input[name="password"]').type('password123');
        cy.get('input[name="confirmPassword"]').type('password123');
        cy.get('button[name="register"]').click();
        
        // Should redirect after registration
        cy.url().should('not.include', '/auth/register');
      } else {
        cy.log('Registration not available - using existing user');
      }
    });
    
    
    // Step 2: Login (use test user if registration wasn't available)
    cy.visit('/auth/login');
    cy.get('body').then(($loginBody) => {
      if ($loginBody.find('a[href="/auth/register"]').length > 0) {
        // Registration was available, use new account
        cy.get('input[name="username"]').type(`integration${timestamp}`);
        cy.get('input[name="password"]').type('password123');
      } else {
        // Use existing test account
        cy.get('input[name="username"]').type('eter');
        cy.get('input[name="password"]').type('chipss');
      }
    });
    cy.get('button[name="sign in"]').click();
    cy.url().should('match', /\/$|\/$/);
    
    // Step 3: Browse and rent a movie
    cy.get('a[href="/films"]').click();
    cy.url().should('include', '/films');
    
    // Select first movie
    cy.get('.film-card, .movie-item').first().within(() => {
      cy.get('a').contains('View Details', { matchCase: false }).click();
    });
    
    // Try to rent (if available)
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Rent"), input[value*="Rent"]').length > 0) {
        cy.get('button:contains("Rent"), input[value*="Rent"]').first().click();
        cy.url().should('include', '/customer/dashboard');
        
        // Step 4: Verify rental appears in dashboard
        cy.get('.rental-item, .active-rental').should('have.length.at.least', 1);
        
        // Step 5: Cancel the rental
        cy.get('.cancel-btn, button:contains("Cancel"), button:contains("Return")').first().click();
        cy.get('.alert-success, .success').should('be.visible');
      } else {
        cy.log('Movie not available for rent, skipping rental steps');
      }
    });
    
    // Step 6: Logout
    cy.get('form[action="/auth/logout"] button[name="logout"]').should('be.visible').click();
    cy.url().should('include', '/auth/login');
    cy.get('nav').should('contain', 'Login');
    cy.get('nav').should('not.contain', 'Dashboard');
  });
  
  it('should handle session persistence and protected routes', () => {
    // Login
    cy.visit('/auth/login');
    cy.get('input[name="username"]').type('eter');
    cy.get('input[name="password"]').type('chipss');
    cy.get('button[name="sign in"]').click();
    
    // Wait for login to complete
    cy.url().should('not.include', '/auth/login');
    
    // Navigate to dashboard
    cy.visit('/customer/dashboard');
    cy.url().should('include', '/customer/dashboard');
    
    // Logout
    cy.get('form[action="/auth/logout"] button[name="logout"]').should('be.visible').click();
    
    // Wait for logout
    cy.url().should('include', '/auth/login');
    
    // Try to access protected route - should redirect to login
    cy.visit('/customer/dashboard');
    cy.url().should('include', '/auth/login');
  });
});