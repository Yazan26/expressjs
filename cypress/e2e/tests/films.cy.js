describe('Films Management', function() {
  beforeEach(function() {
    // Login as staff for basic film access
    cy.visit('/auth/login');
    cy.get('input[name="username"]').type('mike');
    cy.get('input[name="password"]').type('staff123');
    cy.get('button[type="submit"]').click();
  });

  describe('Film Browsing and Search', function() {
    it('should display films index with search functionality', function() {
      cy.visit('/films');
      
      // Check page structure
      cy.get('h1').should('contain', 'Films');
      cy.get('input[name="search"]').should('be.visible');
      cy.get('select[name="category"]').should('be.visible');
      cy.get('select[name="rating"]').should('be.visible');
      cy.get('button[type="submit"]').should('contain', 'Search');
      
      // Check that films are displayed
      cy.get('.card').should('have.length.greaterThan', 0);
      cy.get('.card').first().should('contain.text', '');
    });

    it('should filter films by search term', function() {
      cy.visit('/films');
      
      // Search for a specific film
      cy.get('input[name="search"]').type('ACADEMY');
      cy.get('button[type="submit"]').click();
      
      // Should filter results
      cy.url().should('include', 'search=ACADEMY');
      cy.get('.card').should('have.length.greaterThan', 0);
      cy.get('.card').first().should('contain', 'ACADEMY');
    });

    it('should filter films by category', function() {
      cy.visit('/films');
      
      // Select a category
      cy.get('select[name="category"]').select('Action');
      cy.get('button[type="submit"]').click();
      
      // Should filter results
      cy.url().should('include', 'category=');
      cy.get('.card').should('have.length.greaterThan', 0);
    });

    it('should filter films by rating', function() {
      cy.visit('/films');
      
      // Select a rating
      cy.get('select[name="rating"]').select('PG-13');
      cy.get('button[type="submit"]').click();
      
      // Should filter results
      cy.url().should('include', 'rating=PG-13');
      cy.get('.card').should('have.length.greaterThan', 0);
    });

    it('should show pagination when there are many results', function() {
      cy.visit('/films');
      
      // Check pagination exists
      cy.get('.pagination').should('be.visible');
      cy.get('.page-link').should('have.length.greaterThan', 1);
    });
  });

  describe('Film Detail View', function() {
    it('should display film details page', function() {
      cy.visit('/films');
      
      // Click on first film
      cy.get('.card').first().find('a[href*="/films/"]').first().click();
      
      // Should navigate to detail page
      cy.url().should('include', '/films/');
      cy.get('h1').should('be.visible');
      cy.get('.card').should('contain', 'Description');
      cy.get('.card').should('contain', 'Runtime');
      cy.get('.card').should('contain', 'Rating');
    });

    it('should show film recommendations', function() {
      cy.visit('/films/1');
      
      // Check recommendations section exists
      cy.get('h5').contains('Recommended Films').should('be.visible');
      cy.get('.card').should('have.length.greaterThan', 1);
    });

    it('should handle non-existent film ID', function() {
      cy.visit('/films/99999');
      
      // Should show error or redirect
      cy.get('body').should('contain', 'not found').or('contain', 'error');
    });
  });

  describe('Film Navigation', function() {
    it('should navigate from films list to detail and back', function() {
      cy.visit('/films');
      
      // Go to detail page
      cy.get('.card').first().find('a[href*="/films/"]').first().click();
      cy.url().should('include', '/films/');
      
      // Go back to films list
      cy.get('a').contains('Back to Films').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/films');
    });
  });
});