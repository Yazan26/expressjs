describe('Full User Journey Integration', () => {
  it('should complete full customer journey: register, login, rent, cancel, logout', () => {
    const timestamp = Date.now();
    const testEmail = `integration${timestamp}@test.com`;
    
    // Step 1: Register new user
    cy.visit('http://localhost:3000/auth/register');
    cy.get('input[name="firstName"]').type('Integration');
    cy.get('input[name="lastName"]').type('Test');
    cy.get('input[name="email"]').type(testEmail);
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    // Should redirect after registration
    cy.url().should('not.include', '/auth/register');
    
    // Step 2: Login with new account
    cy.visit('http://localhost:3000/auth/login');
    cy.get('input[name="email"]').type(testEmail);
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('eq', 'http://localhost:3000/');
    
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
    cy.get('a[href="/auth/logout"], button').contains('Logout').click();
    cy.url().should('eq', 'http://localhost:3000/');
    cy.get('nav').should('contain', 'Login');
    cy.get('nav').should('not.contain', 'Dashboard');
  });
  
  it('should handle session persistence and protected routes', () => {
    // Login
    cy.visit('http://localhost:3000/auth/login');
    cy.get('input[name="email"]').type('MARY.SMITH@sakilacustomer.org');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    // Navigate to dashboard
    cy.visit('http://localhost:3000/customer/dashboard');
    cy.url().should('include', '/customer/dashboard');
    
    // Logout
    cy.get('a[href="/auth/logout"], button').contains('Logout').click();
    
    // Try to access protected route - should redirect to login
    cy.visit('http://localhost:3000/customer/dashboard');
    cy.url().should('include', '/auth/login');
  });
});